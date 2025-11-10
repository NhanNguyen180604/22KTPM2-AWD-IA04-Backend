import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { blacklistTokens, UserService } from "src/user/user.service";

@Injectable()
export class JwtAccessTokenGuard implements CanActivate {
    constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(UserService) private readonly userService: UserService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const req: Request = context.switchToHttp().getRequest();
        if (!req.signedCookies || !req.signedCookies.access_token) {
            throw new UnauthorizedException("No access token");
        }

        const access_token: string = req.signedCookies.access_token;
        if (blacklistTokens.has(access_token)) {
            throw new UnauthorizedException("No access token");
        }

        const payload: { sub: number; email: string; } = this.jwtService.verify(access_token, {
            secret: this.configService.get<string>("jwt.access_token.secret"),
        });

        const foundUser = this.userService.findOneBy("id", payload.sub);
        if (!foundUser) {
            blacklistTokens.has(access_token);
            throw new NotFoundException("User not found");
        }

        req.user = foundUser;
        return true;
    }
}