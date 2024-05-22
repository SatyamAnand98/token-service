import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class MicroserviceService {
  constructor(private readonly redisStateService: RedisService) {}

  getHello(role: string, remainingRate: any): string {
    return `Hello ${role}! Your remaining rate limit info: ${remainingRate}`;
  }

  async getTokenInfo(token: string) {
    return this.redisStateService.getKey(token);
  }
}
