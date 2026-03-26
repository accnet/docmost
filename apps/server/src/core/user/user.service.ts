import { UserRepo } from '@docmost/db/repos/user/user.repo';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePasswordHash, diffAuditTrackedFields } from 'src/common/helpers/utils';
import { Workspace } from '@docmost/db/types/entity.types';
import { validateSsoEnforcement } from '../auth/auth.util';
import { AuditEvent, AuditResource } from '../../common/events/audit-events';
import {
  AUDIT_SERVICE,
  IAuditService,
} from '../../integrations/audit/audit.service';
import { PaginationOptions } from '@docmost/db/pagination/pagination-options';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB } from '@docmost/db/types/kysely.types';
import { executeTx } from '@docmost/db/utils';
import { WorkspaceStatus } from '../workspace/workspace.constants';
import { User } from '@docmost/db/types/entity.types';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    @InjectKysely() private readonly db: KyselyDB,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  async findById(userId: string, workspaceId: string) {
    return this.userRepo.findById(userId, workspaceId);
  }

  async update(
    updateUserDto: UpdateUserDto,
    userId: string,
    workspace: Workspace,
  ) {
    const includePassword =
      updateUserDto.email != null && updateUserDto.confirmPassword != null;

    const user = await this.userRepo.findById(userId, workspace.id, {
      includePassword,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // preference update
    if (typeof updateUserDto.fullPageWidth !== 'undefined') {
      return this.userRepo.updatePreference(
        userId,
        'fullPageWidth',
        updateUserDto.fullPageWidth,
      );
    }

    if (typeof updateUserDto.pageEditMode !== 'undefined') {
      return this.userRepo.updatePreference(
        userId,
        'pageEditMode',
        updateUserDto.pageEditMode.toLowerCase(),
      );
    }

    const userBefore = { name: user.name, email: user.email, locale: user.locale };

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.email && user.email != updateUserDto.email) {
      validateSsoEnforcement(workspace);

      if (!updateUserDto.confirmPassword) {
        throw new BadRequestException(
          'You must provide a password to change your email',
        );
      }

      const isPasswordMatch = await comparePasswordHash(
        updateUserDto.confirmPassword,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('You must provide the correct password to change your email');
      }

      if (await this.userRepo.findByEmail(updateUserDto.email, workspace.id)) {
        throw new BadRequestException('A user with this email already exists');
      }

      user.email = updateUserDto.email;
    }

    if (updateUserDto.avatarUrl) {
      user.avatarUrl = updateUserDto.avatarUrl;
    }

    if (updateUserDto.locale) {
      user.locale = updateUserDto.locale;
    }

    delete updateUserDto.confirmPassword;

    await this.userRepo.updateUser(updateUserDto, userId, workspace.id);

    const changes = diffAuditTrackedFields(
      ['name', 'email'],
      updateUserDto,
      userBefore,
      user,
    );

    if (changes) {
      this.auditService.log({
        event: AuditEvent.USER_UPDATED,
        resourceType: AuditResource.USER,
        resourceId: userId,
        changes,
      });
    }

    return user;
  }

  ensureSuperUser(actor: User) {
    if (!actor?.isSuperUser) {
      throw new ForbiddenException();
    }
  }

  async getRegisteredUsers(pagination: PaginationOptions) {
    return this.userRepo.getRegisteredUsersPaginated(pagination);
  }

  async deactivateRegisteredUser(actor: User, userId: string): Promise<void> {
    this.ensureSuperUser(actor);
    const user = await this.userRepo.findByIdGlobal(userId);

    if (!user || !['bootstrap', 'register'].includes(user.registrationSource)) {
      throw new NotFoundException('User not found');
    }

    if (user.isSuperUser) {
      const superUserCount = await this.userRepo.countSuperUsers();
      if (superUserCount <= 1) {
        throw new BadRequestException('Cannot deactivate the last Super User');
      }
    }

    await executeTx(this.db, async (trx) => {
      await this.userRepo.updateUserGlobal(
        {
          deactivatedAt: new Date(),
        },
        user.id,
        trx,
      );

      if (user.workspaceId) {
        await trx
          .updateTable('workspaces')
          .set({
            status: WorkspaceStatus.Suspended,
            updatedAt: new Date(),
          })
          .where('id', '=', user.workspaceId)
          .execute();
      }
    });
  }

  async activateRegisteredUser(actor: User, userId: string): Promise<void> {
    this.ensureSuperUser(actor);
    const user = await this.userRepo.findByIdGlobal(userId);

    if (!user || !['bootstrap', 'register'].includes(user.registrationSource)) {
      throw new NotFoundException('User not found');
    }

    await executeTx(this.db, async (trx) => {
      await this.userRepo.updateUserGlobal(
        {
          deactivatedAt: null,
        },
        user.id,
        trx,
      );

      if (user.workspaceId) {
        await trx
          .updateTable('workspaces')
          .set({
            status: WorkspaceStatus.Active,
            updatedAt: new Date(),
          })
          .where('id', '=', user.workspaceId)
          .execute();
      }
    });
  }

  async deleteRegisteredUser(actor: User, userId: string): Promise<void> {
    this.ensureSuperUser(actor);
    const user = await this.userRepo.findByIdGlobal(userId);

    if (!user || !['bootstrap', 'register'].includes(user.registrationSource)) {
      throw new NotFoundException('User not found');
    }

    if (user.isSuperUser) {
      const superUserCount = await this.userRepo.countSuperUsers();
      if (superUserCount <= 1) {
        throw new BadRequestException('Cannot delete the last Super User');
      }
    }

    await executeTx(this.db, async (trx) => {
      await this.userRepo.updateUserGlobal(
        {
          deletedAt: new Date(),
          deactivatedAt: new Date(),
        },
        user.id,
        trx,
      );

      if (user.workspaceId) {
        await trx
          .updateTable('workspaces')
          .set({
            status: WorkspaceStatus.Suspended,
            updatedAt: new Date(),
          })
          .where('id', '=', user.workspaceId)
          .execute();
      }
    });
  }
}
