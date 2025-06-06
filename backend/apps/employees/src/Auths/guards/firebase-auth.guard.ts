import { FirebaseService } from "@app/firebase";
import { CanActivate, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {

    constructor(private readonly firebaseService: FirebaseService) {
        
    }

    async canActivate(context: any): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const idToken = request.headers.authorization?.split("Bearer ")[1];
        if (!idToken) throw new UnauthorizedException('No token provided');
        const user = await this.firebaseService.verifyIdToken(idToken);
        if (!user) throw new UnauthorizedException('Invalid token');
        request.user = user;
        return true;
    }
}