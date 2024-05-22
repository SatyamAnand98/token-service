import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { PubSubService } from './pubsub.service';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly redisStateService: RedisService,
  ) {
    this.subscribeToChannels();
  }

  private subscribeToChannels() {
    this.pubSubService.subscribe('token_created', async (message) => {
      console.log('Received message on token_created:', message);
      try {
        const username = message.username;

        this.redisStateService.setKey(username, message);
      } catch (error) {
        console.log('Error:', error, message);
      }
    });
  }
}
