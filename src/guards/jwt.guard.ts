import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";
import { TokenService } from "src/token/token.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(UserService) private readonly userService: UserService,
        @Inject(TokenService) private readonly tokenService: TokenService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const res: Response = context.switchToHttp().getResponse();

        const tokenObj = this.tokenService.extractTokensFromCookies(req);
        if (!tokenObj || (!tokenObj.access_token && !tokenObj.refresh_token)) {
            throw new UnauthorizedException("No token");
        }

        if (tokenObj.access_token) {
            const payload = this.jwtService.verify<{ sub: string; email: string; }>(tokenObj.access_token, {
                secret: this.configService.get<string>("jwt.access_token.secret"),
            });
            const foundUser = await this.userService.findOneBy("id", payload.sub);
            if (!foundUser) {
                throw new NotFoundException("User not found");
            }
            req.user = foundUser;
        }
        else if (tokenObj.refresh_token) {
            // check if this token still exists in the database
            const refreshTokenEntity = await this.tokenService.findOneBy("value", tokenObj.refresh_token);
            if (!refreshTokenEntity) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                throw new UnauthorizedException("No token");
            }

            try {
                const payload = this.jwtService.verify<{ sub: string }>(tokenObj.refresh_token, {
                    secret: this.configService.get<string>("jwt.refresh_token.secret"),
                });
                const foundUser = await this.userService.findOneBy("id", payload.sub);
                if (!foundUser) {
                    throw new NotFoundException("User not found");
                }
                req.user = foundUser;

                // create new access token for the user
                const new_access_token = await this.tokenService.createOneAccessToken(foundUser);
                res.cookie("access_token", new_access_token);
            }
            catch (error) {
                if (error.name === "TokenExpiredError") {
                    this.tokenService.deleteOneRefreshTokenByValue(tokenObj.refresh_token);
                    throw new UnauthorizedException("No token");
                }
                else throw error;
            }
        }

        return true;
    }
}