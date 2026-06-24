import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@hvalya/types';
import { SubscriptionsService } from '../../modules/subscriptions/application/subscriptions.service';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { role, id: userId } = req.user;

    if (role !== UserRole.LISTENER) return true;

    const isAllowed = await this.subscriptionsService.isPlaybackAllowed(userId);
    if (!isAllowed) {
      throw new ForbiddenException(
        'Your trial has ended. Please subscribe to continue listening.',
      );
    }
    return true;
  }
}