import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const mockConfigService = {
  get: jest.fn(),
};

function createMockExecutionContext(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('InternalApiKeyGuard', () => {
  let guard: InternalApiKeyGuard;

  beforeEach(() => {
    guard = new InternalApiKeyGuard(mockConfigService as unknown as ConfigService);
    jest.clearAllMocks();
  });

  it('should allow access when the provided key matches the configured key', () => {
    mockConfigService.get.mockReturnValue('correct-key');
    const context = createMockExecutionContext({ 'x-internal-api-key': 'correct-key' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when the provided key does not match', () => {
    mockConfigService.get.mockReturnValue('correct-key');
    const context = createMockExecutionContext({ 'x-internal-api-key': 'wrong-key' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when no key header is provided', () => {
    mockConfigService.get.mockReturnValue('correct-key');
    const context = createMockExecutionContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when INTERNAL_API_KEY is not configured', () => {
    mockConfigService.get.mockReturnValue(undefined);
    const context = createMockExecutionContext({ 'x-internal-api-key': 'anything' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});