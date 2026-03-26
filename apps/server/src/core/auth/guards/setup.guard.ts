import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { UserRepo } from '@docmost/db/repos/user/user.repo';

@Injectable()
export class SetupGuard implements CanActivate {
  constructor(
    private userRepo: UserRepo,
    private environmentService: EnvironmentService,
  ) {}

  async canActivate(): Promise<boolean> {
    if (this.environmentService.isCloud()) {
      return false;
    }

    const superUserCount = await this.userRepo.countSuperUsers();
    if (superUserCount > 0) {
      throw new ForbiddenException('Super User setup already completed.');
    }
    return true;
  }
}
