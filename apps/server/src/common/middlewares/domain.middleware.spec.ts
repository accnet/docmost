import { DomainMiddleware } from './domain.middleware';

describe('DomainMiddleware', () => {
  const workspace = {
    id: 'workspace-1',
    name: 'Workspace',
  };

  const createMiddleware = (overrides?: {
    isSelfHosted?: boolean;
    isCloud?: boolean;
    findFirst?: jest.Mock;
    findByHostname?: jest.Mock;
  }) => {
    const workspaceRepo = {
      findFirst: overrides?.findFirst ?? jest.fn().mockResolvedValue(workspace),
      findByHostname:
        overrides?.findByHostname ?? jest.fn().mockResolvedValue(workspace),
    } as any;

    const environmentService = {
      isSelfHosted: jest.fn().mockReturnValue(overrides?.isSelfHosted ?? true),
      isCloud: jest.fn().mockReturnValue(overrides?.isCloud ?? false),
    } as any;

    return {
      middleware: new DomainMiddleware(workspaceRepo, environmentService),
      workspaceRepo,
    };
  };

  it('resolves the first workspace for self-hosted public auth routes', async () => {
    const { middleware, workspaceRepo } = createMiddleware();
    const req = {
      url: '/api/auth/login',
      headers: {},
    } as any;

    await middleware.use(req, {} as any, jest.fn());

    expect(workspaceRepo.findFirst).toHaveBeenCalled();
    expect(req.workspaceId).toBe(workspace.id);
    expect(req.workspace).toBe(workspace);
  });

  it('resolves self-hosted public auth routes when nest strips the controller prefix', async () => {
    const { middleware, workspaceRepo } = createMiddleware();
    const req = {
      url: '/login',
      headers: {},
    } as any;

    await middleware.use(req, {} as any, jest.fn());

    expect(workspaceRepo.findFirst).toHaveBeenCalled();
    expect(req.workspaceId).toBe(workspace.id);
    expect(req.workspace).toBe(workspace);
  });

  it('resolves self-hosted public workspace invite routes by suffix', async () => {
    const { middleware, workspaceRepo } = createMiddleware();
    const req = {
      url: 'invites/info',
      headers: {},
    } as any;

    await middleware.use(req, {} as any, jest.fn());

    expect(workspaceRepo.findFirst).toHaveBeenCalled();
    expect(req.workspaceId).toBe(workspace.id);
    expect(req.workspace).toBe(workspace);
  });

  it('does not pin self-hosted authenticated routes to the first workspace', async () => {
    const { middleware, workspaceRepo } = createMiddleware();
    const req = {
      url: '/api/users/me',
      headers: {},
    } as any;

    await middleware.use(req, {} as any, jest.fn());

    expect(workspaceRepo.findFirst).not.toHaveBeenCalled();
    expect(req.workspaceId).toBeNull();
    expect(req.workspace).toBeNull();
  });

  it('continues to resolve cloud workspaces by hostname', async () => {
    const { middleware, workspaceRepo } = createMiddleware({
      isSelfHosted: false,
      isCloud: true,
    });
    const req = {
      url: '/api/workspace/public',
      headers: { host: 'team.example.com' },
    } as any;

    await middleware.use(req, {} as any, jest.fn());

    expect(workspaceRepo.findByHostname).toHaveBeenCalledWith('team');
    expect(req.workspaceId).toBe(workspace.id);
    expect(req.workspace).toBe(workspace);
  });
});
