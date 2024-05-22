import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from 'src/redis/redis.service';
import { EEvents } from 'src/store/enums/event.enum';
import { IEvent } from 'src/store/interfaces/events.interface';

@Injectable()
export class PubSubService {
  constructor(
    @Inject('REDIS_SUBSCRIBE_CLIENT') private readonly redisClient: Redis,
    private readonly redisStateService: RedisService,
  ) {
    this.subscribeToChannels();
  }
  async publish(channel: string, message: any) {
    await this.redisClient.publish(channel, JSON.stringify(message));
  }
  async subscribe(channel: string, callback: (message: any) => void) {
    // await this.redisStateService.deleteAllKeys();
    console.log('Subscribing to channel');
    await this.redisClient.subscribe(channel);
    this.redisClient.on('message', (chnl, message) => {
      if (chnl === channel) {
        callback(JSON.parse(message));
      }
    });
  }

  async subscribeToChannels() {
    console.log('Subscribed to topic token_created');
    await this.subscribe('token_created', async (message) => {
      const data: IEvent = JSON.parse(message.message);
      try {
        const token = data.token;
        const eventType = data.eventType;
        const tokenData: IEvent = {
          username: data.username,
          rateLimiter: data.rateLimiter,
          iat: data.iat,
          exp: data.exp,
          role: data.role,
          remainingRate: data.rateLimiter,
          isActive: data.isActive,
        };

        if (eventType == EEvents.DELETE_KEY) {
          await this.redisStateService.clearKey(token);
        } else {
          this.redisStateService.setKey(token, JSON.stringify(tokenData));
        }
      } catch (error) {
        console.log('Error:', error, message);
      }
    });
  }
}
