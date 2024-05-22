export interface IEvent {
  username: string;
  rateLimiter: string | number;
  iat: string;
  exp: string;
  role: string;
  remainingRate: string | number;
  resetTimestamp?: any;
}
