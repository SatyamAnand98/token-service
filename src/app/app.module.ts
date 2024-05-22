import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/decorators/auth/auth.guard';
import { RolesGuard } from 'src/decorators/roles/role.guard';
import { MicroserviceModule } from 'src/microservice/microservice.module';
import { RedisModule } from 'src/redis/redis.module';
import { DatabaseModule } from 'src/store/Database/mongoDb.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 10 * 1000,
    //       limit: 2,
    //     },
    //   ],
    // }),
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
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
  ],
})
export class AppModule {}
