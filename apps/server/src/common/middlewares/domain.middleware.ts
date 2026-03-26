import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { WorkspaceRepo } from '@docmost/db/repos/workspace/workspace.repo';

const SELF_HOST_PUBLIC_WORKSPACE_PATHS = [
  ['/auth/login', '/login'],
  ['/auth/forgot-password', '/forgot-password'],
  ['/auth/password-reset', '/password-reset'],
  ['/auth/verify-token', '/verify-token'],
  ['/workspace/public', '/public'],
  ['/workspace/invites/info', '/invites/info'],
  ['/workspace/invites/accept', '/invites/accept'],
] as const;

@Injectable()
export class DomainMiddleware implements NestMiddleware {
  constructor(
    private workspaceRepo: WorkspaceRepo,
    private environmentService: EnvironmentService,
  ) {}
  async use(
    req: FastifyRequest['raw'],
    res: FastifyReply['raw'],
    next: () => void,
  ) {
    if (this.environmentService.isSelfHosted()) {
      if (!this.shouldResolveSelfHostedWorkspace(req)) {
        (req as any).workspaceId = null;
        (req as any).workspace = null;
        return next();
      }

      const workspace = await this.workspaceRepo.findFirst();
      if (!workspace) {
        (req as any).workspaceId = null;
        (req as any).workspace = null;
        return next();
      }

      (req as any).workspaceId = workspace.id;
      (req as any).workspace = workspace;
    } else if (this.environmentService.isCloud()) {
      const header = req.headers.host;
      const subdomain = header.split('.')[0];

      const workspace = await this.workspaceRepo.findByHostname(subdomain);

      if (!workspace) {
        (req as any).workspaceId = null;
        return next();
      }

      (req as any).workspaceId = workspace.id;
      (req as any).workspace = workspace;
    }

    next();
  }

  private shouldResolveSelfHostedWorkspace(
    req: FastifyRequest['raw'],
  ): boolean {
    const path = this.normalizePath(req.url);
    return SELF_HOST_PUBLIC_WORKSPACE_PATHS.some((candidates) =>
      candidates.some(
        (candidate) =>
          path === candidate ||
          path.startsWith(`${candidate}/`) ||
          path.endsWith(candidate),
      ),
    );
  }

  private normalizePath(path?: string): string {
    const cleanPath = path?.split('?')[0] ?? '';
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return normalizedPath.startsWith('/api')
      ? normalizedPath.slice(4) || '/'
      : normalizedPath;
  }
}
