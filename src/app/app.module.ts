import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/decorators/auth/auth.guard';
import { RolesGuard } from 'src/decorators/roles/role.guard';
import { MicroserviceModule } from 'src/microservice/microservice.module';
import { DatabaseModule } from 'src/store/Database/mongoDb.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { RedisModule } from 'src/redis/redis.module';
import { AllExceptionsFilter } from 'src/store/middlewares/http-exception.filter';
import { LoggingMiddleware } from 'src/store/middlewares/logging-middleware';
import { RequestIdMiddleware } from 'src/store/middlewares/request-id.middleware';
import { JwtGenerationService } from 'src/store/utils/jwt.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.development.env'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: 'Access_token_management',
    }),
    DatabaseModule,
    AuthModule,
    MicroserviceModule,
    PubSubModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
    JwtGenerationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
