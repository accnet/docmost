jest.mock('../../workspace/services/workspace.service', () => ({
  WorkspaceService: class WorkspaceService {},
}));

jest.mock('@docmost/db/repos/user/user.repo', () => ({
  UserRepo: class UserRepo {},
}));

jest.mock('@docmost/db/repos/group/group-user.repo', () => ({
  GroupUserRepo: class GroupUserRepo {},
}));

jest.mock('nestjs-kysely', () => ({
  InjectKysely: () => () => undefined,
}));

jest.mock('../../../integrations/audit/audit.service', () => ({
  AUDIT_SERVICE: 'AUDIT_SERVICE',
}));

import { SignupService } from './signup.service';
import { UserRole } from '../../../common/helpers/types/permission';

jest.mock('@docmost/db/utils', () => ({
  executeTx: async (_db: unknown, callback: (trx?: unknown) => Promise<unknown>) =>
    callback(undefined),
}));

describe('SignupService', () => {
  const createService = () => {
    const userRepo = {
      insertUser: jest.fn(),
      findByEmail: jest.fn(),
    } as any;
    const workspaceService = {
      create: jest.fn(),
      addUserToWorkspace: jest.fn(),
    } as any;
    const groupUserRepo = {
      addUserToDefaultGroup: jest.fn(),
    } as any;
    const auditService = {
      log: jest.fn(),
    } as any;

    const service = new SignupService(
      userRepo,
      workspaceService,
      groupUserRepo,
      {} as any,
      auditService,
    );

    return {
      service,
      userRepo,
      workspaceService,
      auditService,
    };
  };

  it('bootstraps the initial super user with bootstrap metadata', async () => {
    const { service, userRepo, workspaceService, auditService } = createService();
    const insertedUser = {
      id: 'user-1',
      email: 'root@example.com',
      name: 'Root',
    };
    const workspace = {
      id: 'workspace-1',
      defaultSpaceId: 'space-1',
    };

    userRepo.insertUser.mockResolvedValue(insertedUser);
    workspaceService.create.mockResolvedValue(workspace);

    const result = await service.bootstrapSuperUser({
      name: 'Root',
      email: 'root@example.com',
      password: 'password',
      workspaceName: 'Root Workspace',
      hostname: 'root',
    });

    expect(userRepo.insertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Root',
        email: 'root@example.com',
        role: UserRole.OWNER,
        registrationSource: 'bootstrap',
        isSuperUser: true,
      }),
      undefined,
    );
    expect(workspaceService.create).toHaveBeenCalledWith(
      insertedUser,
      {
        name: 'Root Workspace',
        hostname: 'root',
      },
      undefined,
    );
    expect(result).toEqual({
      user: expect.objectContaining({
        id: 'user-1',
        workspaceId: 'workspace-1',
      }),
      workspace,
    });
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { source: 'bootstrap' },
      }),
    );
  });

  it('keeps initialSetup aligned with bootstrapSuperUser', async () => {
    const { service } = createService();
    const bootstrapSpy = jest
      .spyOn(service, 'bootstrapSuperUser')
      .mockResolvedValue({ user: {} as any, workspace: {} as any });

    await service.initialSetup({
      name: 'Root',
      email: 'root@example.com',
      password: 'password',
      workspaceName: 'Root Workspace',
      hostname: 'root',
    });

    expect(bootstrapSpy).toHaveBeenCalled();
  });

  it('registers an owner with a dedicated workspace', async () => {
    const { service, userRepo, workspaceService, auditService } = createService();
    const insertedUser = {
      id: 'user-2',
      email: 'owner@example.com',
      name: 'Owner',
    };
    const workspace = {
      id: 'workspace-2',
      defaultSpaceId: 'space-2',
    };

    userRepo.findRegisteredByEmailGlobal = jest.fn().mockResolvedValue(null);
    userRepo.insertUser.mockResolvedValue(insertedUser);
    workspaceService.create.mockResolvedValue(workspace);

    const result = await service.registerOwnerWithWorkspace({
      name: 'Owner',
      email: 'owner@example.com',
      password: 'password',
      workspaceName: 'Owner Workspace',
      hostname: 'owner',
    });

    expect(userRepo.findRegisteredByEmailGlobal).toHaveBeenCalledWith(
      'owner@example.com',
      { trx: undefined },
    );
    expect(userRepo.insertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.OWNER,
        registrationSource: 'register',
      }),
      undefined,
    );
    expect(result).toEqual({
      user: expect.objectContaining({
        id: 'user-2',
        workspaceId: 'workspace-2',
      }),
      workspace,
    });
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { source: 'register' },
      }),
    );
  });
});
