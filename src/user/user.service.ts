import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { users } from './mock-users';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const blacklistTokens = new Set<string>();

@Injectable()
export class UserService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) { }

    login(dto: LoginDto): { access_token: string, refresh_token?: string } {
        const foundUser = this.findOneBy('email', dto.email);
        if (!foundUser || foundUser.password !== dto.password) {
            throw new UnauthorizedException("Invalid login credentials");
        }

        const payload = { sub: foundUser.id, email: foundUser.email };

        const access_token = this.jwtService.sign(payload, {
            secret: this.configService.get("jwt.access_token.secret"),
            expiresIn: this.configService.get("jwt.access_token.expires_in"),
        });

        if (dto.rememberMe) {
            const refresh_token = this.jwtService.sign({ sub: foundUser.id }, {
                secret: this.configService.get("jwt.refresh_token.secret"),
                expiresIn: this.configService.get("jwt.refresh_token.expires_in"),
            });

            return { access_token, refresh_token };
        }

        return { access_token };
    }

    findOneBy(field: "id" | "email", value: number | string) {
        return users.find(u => u[field] === value);
    }
}
