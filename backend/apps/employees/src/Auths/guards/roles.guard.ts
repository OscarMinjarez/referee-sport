import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EmployeeTypeValue } from "@app/entities";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<EmployeeTypeValue[]>(
            "role",
            context.getHandler()
        );
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                `Need to be ${requiredRoles.join(' or ')} to access this resource`,
            );
        }
        return true;
    }
}