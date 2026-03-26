jest.mock('@docmost/db/repos/user/user.repo', () => ({
  UserRepo: class UserRepo {},
}));

jest.mock('../../../integrations/environment/environment.service', () => ({
  EnvironmentService: class EnvironmentService {},
}));

import { ForbiddenException } from '@nestjs/common';
import { SetupGuard } from './setup.guard';

describe('SetupGuard', () => {
  const createGuard = (overrides?: {
    isCloud?: boolean;
    superUserCount?: number;
  }) => {
    const userRepo = {
      countSuperUsers: jest
        .fn()
        .mockResolvedValue(overrides?.superUserCount ?? 0),
    } as any;

    const environmentService = {
      isCloud: jest.fn().mockReturnValue(overrides?.isCloud ?? false),
    } as any;

    return new SetupGuard(userRepo, environmentService);
  };

  it('blocks setup in cloud mode', async () => {
    const guard = createGuard({ isCloud: true });

    await expect(guard.canActivate()).resolves.toBe(false);
  });

  it('blocks setup when a super user already exists', async () => {
    const guard = createGuard({ superUserCount: 1 });

    await expect(guard.canActivate()).rejects.toThrow(
      new ForbiddenException('Super User setup already completed.'),
    );
  });

  it('allows setup when there is no super user', async () => {
    const guard = createGuard();

    await expect(guard.canActivate()).resolves.toBe(true);
  });
});
