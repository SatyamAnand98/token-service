import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

ConfigModule.forRoot({
  envFilePath: ['.development.env'],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

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
