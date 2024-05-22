import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { accessTokenConstant } from 'src/store/constants';

@Injectable()
export class JwtGenerationService {
  private readonly logger = new Logger(JwtGenerationService.name);
  private readonly secretKey = accessTokenConstant.secret;

  sign(payload: any, expiresIn: string): string {
    return jwt.sign(payload, this.secretKey, { expiresIn });
  }

  verify(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new Error('Token verification failed');
    }
  }
}
