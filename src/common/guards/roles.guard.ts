import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        // If no user or no role, deny
        if (!user || !user.role) {
            return false;
        }

        // Case-insensitive check (assuming roles are stored as 'ADMIN', 'SELLER' or 'admin', 'seller')
        // We will normalize to upper case for comparison
        return requiredRoles.some((role) => user.role?.toUpperCase() === role.toUpperCase());
    }
}
