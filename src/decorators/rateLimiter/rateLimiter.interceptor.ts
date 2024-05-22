import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from 'src/redis/redis.service';
import { IEvent } from 'src/store/interfaces/events.interface';
import { IResponse } from 'src/store/interfaces/response.interface';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private readonly redisStateService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const user = request.user;
    const response = context.switchToHttp().getResponse();
    const rateLimit = user.rateLimiter;
    const rateLimitResetTime = 60 * 1000; // 1 minute

    if (!rateLimit) {
      return next.handle();
    }

    try {
      const tokenInfo = await this.redisStateService.getKey(token);
      let remainingLimit: number;
      let resetTimestamp: number;
      let tokenData: IEvent;

      if (tokenInfo) {
        tokenData = JSON.parse(tokenInfo);
        remainingLimit = tokenData.remainingRate;
        resetTimestamp = tokenData.resetTimestamp;

        if (Date.now() > resetTimestamp || !resetTimestamp) {
          remainingLimit = rateLimit;
          resetTimestamp = Date.now() + rateLimitResetTime;
        }
      } else {
        remainingLimit = rateLimit;
        resetTimestamp = Date.now() + rateLimitResetTime;
      }

      if (remainingLimit <= 0) {
        const responseObj: IResponse = {
          data: {},
          message: 'Rate limit exceeded',
          metadata: {
            error: true,
          },
        };
        response.status(429).json(responseObj);
        return;
      }

      remainingLimit -= 1;

      const tokenInfoWrite: IEvent = {
        username: user.username,
        rateLimiter: rateLimit,
        iat: user.iat,
        exp: user.exp,
        role: user.role[0],
        remainingRate: remainingLimit,
        resetTimestamp,
        isActive: tokenData.isActive,
      };

      await this.redisStateService.setKey(
        token,
        JSON.stringify(tokenInfoWrite),
      );

      const remainingSeconds = Math.floor((resetTimestamp - Date.now()) / 1000);

      response.setHeader('x-ratelimit-limit', rateLimit);
      response.setHeader('x-ratelimit-remaining', remainingLimit);
      response.setHeader('x-ratelimit-reset', remainingSeconds);

      return next.handle().pipe(
        tap(() => {
          if (remainingLimit === 0) {
            setTimeout(async () => {
              await this.redisStateService.setKey(
                token,
                JSON.stringify({
                  remainingRate: rateLimit,
                  resetTimestamp: Date.now() + rateLimitResetTime,
                }),
              );
            }, rateLimitResetTime);
          }
        }),
      );
    } catch (error) {
      response.status(500).send('Internal Server Error');
    }
  }
}
