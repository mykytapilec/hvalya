import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TrialGuard } from './trial.guard';
import { SubscriptionsService } from '../../modules/subscriptions/application/subscriptions.service';
import { UserRole } from '@hvalya/types';

const mockSubscriptionsService = {
  isPlaybackAllowed: jest.fn(),
};

function makeContext(role: UserRole, userId = 'user-uuid'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: userId, email: 'test@hvalya.com', username: 'test', role },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('TrialGuard', () => {
  let guard: TrialGuard;

  beforeEach(() => {
    guard = new TrialGuard(mockSubscriptionsService as unknown as SubscriptionsService);
    jest.clearAllMocks();
  });

  it('should allow ADMIN without checking subscription', async () => {
    const result = await guard.canActivate(makeContext(UserRole.ADMIN));
    expect(result).toBe(true);
    expect(mockSubscriptionsService.isPlaybackAllowed).not.toHaveBeenCalled();
  });

  it('should allow ARTIST without checking subscription', async () => {
    const result = await guard.canActivate(makeContext(UserRole.ARTIST));
    expect(result).toBe(true);
    expect(mockSubscriptionsService.isPlaybackAllowed).not.toHaveBeenCalled();
  });

  it('should allow LISTENER with active trial', async () => {
    mockSubscriptionsService.isPlaybackAllowed.mockResolvedValue(true);
    const result = await guard.canActivate(makeContext(UserRole.LISTENER));
    expect(result).toBe(true);
    expect(mockSubscriptionsService.isPlaybackAllowed).toHaveBeenCalledWith('user-uuid');
  });

  it('should throw ForbiddenException for LISTENER with expired trial', async () => {
    mockSubscriptionsService.isPlaybackAllowed.mockResolvedValue(false);
    await expect(guard.canActivate(makeContext(UserRole.LISTENER))).rejects.toThrow(
      ForbiddenException,
    );
  });
});