import { SetMetadata } from '@nestjs/common';
import { EmployeeTypeValue } from '@app/entities';

export const Roles = (...roles: EmployeeTypeValue[]) => SetMetadata('roles', roles);