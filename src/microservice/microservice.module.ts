import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { DatabaseModule } from 'src/store/Database/mongoDb.module';
import { MicroserviceController } from './microservice.controller';
import { MicroserviceService } from './microservice.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [MicroserviceController],
  providers: [MicroserviceService],
})
export class MicroserviceModule {}
