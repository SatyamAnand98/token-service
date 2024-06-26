import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/store/Database/mongoDb.module';
import { AuthGuard } from '../decorators/auth/auth.guard';
import { RolesGuard } from '../decorators/roles/role.guard';
import { accessTokenConstant } from '../store/constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisModule } from 'src/redis/redis.module';
import { JwtGenerationService } from 'src/store/utils/jwt.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: accessTokenConstant.secret,
    }),
    DatabaseModule,
    RedisModule,
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    JwtGenerationService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
