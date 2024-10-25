
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/roles/roles.schema';


export const ROLES_KEY = 'roles';
export const RolesAllowed = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);