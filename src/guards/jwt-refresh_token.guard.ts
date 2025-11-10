import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { blacklistTokens, UserService } from "src/user/user.service";

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
    constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(UserService) private readonly userService: UserService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const req: Request = context.switchToHttp().getRequest();
        if (!req.signedCookies || !req.signedCookies.refresh_token) {
            throw new UnauthorizedException("No refresh token");
        }

        const refresh_token: string = req.signedCookies.refresh_token;
        if (blacklistTokens.has(refresh_token)) {
            throw new UnauthorizedException("No refresh token");
        }

        const payload: { sub: number; email: string; } = this.jwtService.verify(refresh_token, {
            secret: this.configService.get<string>("jwt.refresh_token.secret"),
        });

        const foundUser = this.userService.findOneBy("id", payload.sub);
        if (!foundUser) {
            blacklistTokens.has(refresh_token);
            throw new NotFoundException("User not found");
        }

        req.user = foundUser;
        return true;
    }
}