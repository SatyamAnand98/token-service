import {
  Controller,
  Get,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MicroserviceService } from './microservice.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from 'src/decorators/auth/auth.guard';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { ERole } from 'src/store/enums/role.enum';
import { Response } from 'express';
import { RateLimitInterceptor } from 'src/decorators/rateLimiter/rateLimiter.interceptor';

@Controller('microservice')
export class MicroserviceController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  @UseGuards(AuthGuard)
  @Roles(ERole.Admin)
  @UseInterceptors(RateLimitInterceptor)
  @Get('admin')
  callAdmin(@Request() req: any, @Res() res: Response) {
    const rateLimitLimit = res.getHeader('x-ratelimit-limit');
    const rateLimitRemaining = res.getHeader('x-ratelimit-remaining');
    const rateLimitReset = res.getHeader('x-ratelimit-reset');

    res.status(200).json({
      message: this.microserviceService.getHello('Admin', rateLimitRemaining),
      totalLimit: rateLimitLimit,
      remainingLimit: rateLimitRemaining,
      resetTime: rateLimitReset,
    });
  }

  @UseGuards(AuthGuard)
  @Roles(ERole.User)
  @UseInterceptors(RateLimitInterceptor)
  @Get('user')
  callUser(@Request() req: any, @Res() res: Response) {
    const rateLimitLimit = res.getHeader('x-ratelimit-limit');
    const rateLimitRemaining = res.getHeader('x-ratelimit-remaining');
    const rateLimitReset = res.getHeader('x-ratelimit-reset');

    res.status(200).json({
      message: this.microserviceService.getHello('User', rateLimitRemaining),
      totalLimit: rateLimitLimit,
      remainingLimit: rateLimitRemaining,
      resetTime: rateLimitReset,
    });
  }

  @UseGuards(AuthGuard)
  @Roles(ERole.Guest)
  @UseInterceptors(RateLimitInterceptor)
  @Get('guest')
  callGuest(@Request() req: any, @Res() res: Response) {
    const rateLimitLimit = res.getHeader('x-ratelimit-limit');
    const rateLimitRemaining = res.getHeader('x-ratelimit-remaining');
    const rateLimitReset = res.getHeader('x-ratelimit-reset');

    res.status(200).json({
      message: this.microserviceService.getHello('Guest', rateLimitRemaining),
      totalLimit: rateLimitLimit,
      remainingLimit: rateLimitRemaining,
      resetTime: rateLimitReset,
    });
  }
}
