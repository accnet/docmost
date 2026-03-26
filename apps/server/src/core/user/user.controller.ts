import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthWorkspace } from '../../common/decorators/auth-workspace.decorator';
import { User, Workspace } from '@docmost/db/types/entity.types';
import { WorkspaceRepo } from '@docmost/db/repos/workspace/workspace.repo';
import { PaginationOptions } from '@docmost/db/pagination/pagination-options';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly workspaceRepo: WorkspaceRepo,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('me')
  async getUserInfo(
    @AuthUser() authUser: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const memberCount = await this.workspaceRepo.getActiveUserCount(
      workspace.id,
    );

    const { licenseKey, ...rest } = workspace;

    const workspaceInfo = {
      ...rest,
      memberCount,
    };

    return { user: authUser, workspace: workspaceInfo };
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.userService.update(updateUserDto, user.id, workspace);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/system/list')
  async getSystemUsers(
    @Body() pagination: PaginationOptions,
    @AuthUser() authUser: User,
  ) {
    if (!authUser.isSuperUser) {
      throw new ForbiddenException();
    }

    return this.userService.getRegisteredUsers(pagination);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/system/deactivate')
  async deactivateSystemUser(
    @Body() dto: { userId: string },
    @AuthUser() authUser: User,
  ) {
    if (!authUser.isSuperUser) {
      throw new ForbiddenException();
    }

    return this.userService.deactivateRegisteredUser(authUser, dto.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/system/activate')
  async activateSystemUser(
    @Body() dto: { userId: string },
    @AuthUser() authUser: User,
  ) {
    if (!authUser.isSuperUser) {
      throw new ForbiddenException();
    }

    return this.userService.activateRegisteredUser(authUser, dto.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/system/delete')
  async deleteSystemUser(
    @Body() dto: { userId: string },
    @AuthUser() authUser: User,
  ) {
    if (!authUser.isSuperUser) {
      throw new ForbiddenException();
    }

    return this.userService.deleteRegisteredUser(authUser, dto.userId);
  }
}
