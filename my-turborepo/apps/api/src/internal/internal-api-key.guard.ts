import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-internal-api-key'];
    const expectedKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException('Internal API key is not configured');
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}