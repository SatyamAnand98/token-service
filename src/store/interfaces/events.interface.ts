import { EEvents } from '../enums/event.enum';
import { ERole } from '../enums/role.enum';

export interface IEvent {
  token?: string;
  role: ERole;
  rateLimiter: number;
  username: string;
  iat: Date;
  exp: Date;
  remainingRate?: number;
  resetTimestamp?: any;
  eventType?: EEvents;
  isActive: boolean;
}
