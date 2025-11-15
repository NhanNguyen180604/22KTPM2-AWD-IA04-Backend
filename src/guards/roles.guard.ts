import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { ROLES_KEY } from 'src/decorators/roles.decorators';
import { UserRoleEnum } from 'src/user/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const req: Request = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user) return false;
        return requiredRoles.some((role) => user.role === role);
    }
}