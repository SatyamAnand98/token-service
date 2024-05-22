import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { IS_PUBLIC_KEY, accessTokenConstant } from '../../store/constants';
import { JwtGenerationService } from 'src/store/utils/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtGenerationService,
    private reflector: Reflector,
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
      const payload = this.jwtService.verify(token);

      if (Date.now() >= payload.exp * 1000) {
        await this.redisStateService.clearKey(token);
        throw new UnauthorizedException('Token has expired.');
      }

      let tokenInfo = await this.redisStateService.getKey(token);
      tokenInfo = JSON.parse(tokenInfo);

      if (!tokenInfo || !tokenInfo.isActive) {
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
