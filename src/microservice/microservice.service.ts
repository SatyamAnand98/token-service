import { Injectable } from '@nestjs/common';

@Injectable()
export class MicroserviceService {
  getHello(role: string, remainingRate: any): string {
    return `Hello ${role}! Your remaining rate limit info: ${remainingRate}`;
  }
}
