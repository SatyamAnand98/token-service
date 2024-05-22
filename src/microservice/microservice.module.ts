import { Module } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { MicroserviceController } from './microservice.controller';
import { MicroserviceService } from './microservice.service';
import { RedisModule } from 'src/redis/redis.module';
import { DatabaseModule } from 'src/store/Database/mongoDb.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [MicroserviceController],
  providers: [
    MicroserviceService,
    // RedisService
  ],
})
export class MicroserviceModule {}
