import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AuthGuard } from './decorators/auth/auth.guard';
import { RateLimitInterceptor } from './decorators/rateLimiter/rateLimiter.interceptor';
import { RedisService } from './redis/redis.service';
import { AllExceptionsFilter } from './store/middlewares/http-exception.filter';
import { JwtGenerationService } from './store/utils/jwt.service';

ConfigModule.forRoot({
  envFilePath: ['.development.env'],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('token-info');
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtGenerationService);
  const redisService = app.get(RedisService);

  app.useGlobalInterceptors(new RateLimitInterceptor(redisService));
  app.useGlobalGuards(new AuthGuard(jwtService, reflector, redisService));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
  });

  /**
   * Creates Swagger for the services with below details:
   * -  Title
   * -  Description
   * -  Versioning
   * -  Tag
   */
  const config = new DocumentBuilder()
    .setTitle('Token Activity Checker')
    .setDescription('Token Activity Checker API Server')
    .setVersion('1.0')
    .addTag('Token Activity')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app
    .listen(process.env.PORT)
    .then(() =>
      console.log(`Application started at port number: ${process.env.PORT}`),
    );
}
bootstrap();
