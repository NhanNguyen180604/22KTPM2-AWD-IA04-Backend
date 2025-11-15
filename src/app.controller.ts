import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorators';
import { UserRoleEnum } from './user/user-role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtGuard)
  @Get('protected')
  protectedRoute(): string {
    return "This route is protected";
  }

  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('admin-only')
  adminOnlyRoute(): string {
    return "This route is for admin only";
  }
}
