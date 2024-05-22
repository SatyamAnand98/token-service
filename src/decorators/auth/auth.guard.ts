import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { AccessToken } from 'src/store/Schema/token.entity';
import { EDbNames } from 'src/store/enums/dbNames';
import { IS_PUBLIC_KEY, accessTokenConstant } from '../../store/constants';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @InjectModel(EDbNames.ACCESS_TOKEN)
    private readonly redisStateService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: accessTokenConstant.secret,
      });

      if (Date.now() >= payload.exp * 1000) {
        await this.redisStateService.clearKey(token);
        throw new UnauthorizedException('Token has expired');
      }

      let tokenInfo = await this.redisStateService.getKey(token);
      tokenInfo = JSON.parse(tokenInfo);

      if (!tokenInfo) {
        throw new UnauthorizedException();
      }

      const userInfo = {
        username: payload.username,
        role: [tokenInfo.role],
        rateLimiter: tokenInfo.rateLimiter,
        iat: payload.iat,
        exp: payload.exp,
      };

      request['user'] = userInfo;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
