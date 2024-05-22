import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from 'src/redis/redis.service';
import { IEvent } from 'src/store/enums/event';

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

      if (tokenInfo) {
        const tokenData = JSON.parse(tokenInfo);
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
        response.status(429).send('Rate limit exceeded');
        return;
      }

      remainingLimit -= 1;

      const tokenData: IEvent = {
        username: user.username,
        rateLimiter: rateLimit,
        iat: user.iat,
        exp: user.exp,
        role: user.role[0],
        remainingRate: remainingLimit,
        resetTimestamp,
      };

      await this.redisStateService.setKey(token, JSON.stringify(tokenData));

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
      console.error(error);
      response.status(500).send('Internal Server Error');
    }
  }
}
