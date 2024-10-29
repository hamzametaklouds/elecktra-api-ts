import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/roles/roles.schema';

export const ROLES_KEY = 'roles';
console.log('in the roles')
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);