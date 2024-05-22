import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { ERole } from 'src/store/enums/role.enum';
import { MicroserviceService } from './microservice.service';
import { Public } from 'src/store/constants';
import { IResponse } from 'src/store/interfaces/response.interface';

@Controller('microservice')
export class MicroserviceController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  @Roles(ERole.Admin)
  @Get('admin')
  @HttpCode(HttpStatus.OK)
  callAdmin(@Request() req: any, @Res() res: Response) {
    const rateLimitLimit = res.getHeader('x-ratelimit-limit');
    const rateLimitRemaining = res.getHeader('x-ratelimit-remaining');
    const rateLimitReset = res.getHeader('x-ratelimit-reset');

    const responseObj: IResponse = {
      data: {
        message: this.microserviceService.getHello('Admin', rateLimitRemaining),
        totalLimit: rateLimitLimit,
        remainingLimit: rateLimitRemaining,
        resetTime: rateLimitReset,
      },
      message: 'Success',
      metadata: {
        error: false,
      },
    };
    res.status(200).json(responseObj);
  }

  @Roles(ERole.User)
  @Get('user')
  @HttpCode(HttpStatus.OK)
  callUser(@Request() req: Request, @Res() res: Response) {
    const rateLimitLimit = res.getHeader('x-ratelimit-limit');
    const rateLimitRemaining = res.getHeader('x-ratelimit-remaining');
    const rateLimitReset = res.getHeader('x-ratelimit-reset');

    const responseObj: IResponse = {
      data: {
        message: this.microserviceService.getHello('User', rateLimitRemaining),
        totalLimit: rateLimitLimit,
        remainingLimit: rateLimitRemaining,
        resetTime: rateLimitReset,
      },
      message: 'Success',
      metadata: {
        error: false,
      },
    };

    res.status(200).json(responseObj);
  }

  @Roles(ERole.Guest)
  @Get('guest')
  @HttpCode(HttpStatus.OK)
  callGuest(@Request() req: any, @Res() res: Response) {
    const rateLimitLimit = res.getHeader('x-ratelimit-limit');
    const rateLimitRemaining = res.getHeader('x-ratelimit-remaining');
    const rateLimitReset = res.getHeader('x-ratelimit-reset');

    const responseObj: IResponse = {
      data: {
        message: this.microserviceService.getHello('Guest', rateLimitRemaining),
        totalLimit: rateLimitLimit,
        remainingLimit: rateLimitRemaining,
        resetTime: rateLimitReset,
      },
      message: 'Success',
      metadata: {
        error: false,
      },
    };

    res.status(200).json(responseObj);
  }

  @Roles(ERole.Guest)
  @Get('token')
  @HttpCode(HttpStatus.OK)
  async getTokenInfo(@Request() req: any, @Res() res: Response) {
    const token = req.headers.authorization.split(' ')[1];

    const responseObj: IResponse = {
      data: JSON.parse(await this.microserviceService.getTokenInfo(token)),
      message: 'Rate is refreshed every minute!',
      metadata: {
        error: false,
      },
    };

    res.status(200).json(responseObj);
  }
}
