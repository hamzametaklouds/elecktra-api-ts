import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // No specific roles required for this route
        }

        const { user } = context.switchToHttp().getRequest();
        const userRoles = user.roles || []; // Ensure user roles is an array

        // Check if any of the user's roles are included in the required roles
        return userRoles.some((role) => requiredRoles.includes(role));
    }
}