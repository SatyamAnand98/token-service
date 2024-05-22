import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { PubSubService } from './pub-sub.service';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly redisStateService: RedisService,
  ) {
    this.subscribeToChannels();
  }

  private subscribeToChannels() {
    console.log('Subscribed to topic token_created');
    this.pubSubService.subscribe('token_created', async (message) => {
      console.log('Received message on token_created:', message);
      try {
        const token = message.token;

        this.redisStateService.setKey(token, message);
      } catch (error) {
        console.log('Error:', error, message);
      }
    });
  }
}
