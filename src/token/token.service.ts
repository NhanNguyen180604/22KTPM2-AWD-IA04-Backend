import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { RefreshToken } from 'src/entities/refresh-token.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) { }

    async findOneBy(field: "userId" | "value", value: string) {
        return this.refreshTokenRepository.findOneBy({ [field]: value });
    }

    async createOneAccessToken(user: string | User) {
        if (typeof (user) === 'string') {
            user = (await this.userService.findOneBy('id', user))!;
        }
        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload, {
            secret: this.configService.get("jwt.access_token.secret"),
            expiresIn: this.configService.get("jwt.access_token.expires_in"),
        });
        return access_token;
    }

    async createOneRefreshToken(user: string | User) {
        if (typeof (user) === 'string') {
            user = (await this.userService.findOneBy('id', user))!;
        }
        const refresh_token = this.jwtService.sign({ sub: user.id }, {
            secret: this.configService.get("jwt.refresh_token.secret"),
            expiresIn: this.configService.get("jwt.refresh_token.expires_in"),
        });
        const refreshTokenEntity = this.refreshTokenRepository.create({
            user,
            value: refresh_token,
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);
        return refresh_token;
    }

    async deleteOneRefreshTokenByUser(user: string | User) {
        if (typeof (user) === 'string') {
            user = (await this.userService.findOneBy('id', user))!;
        }
        await this.refreshTokenRepository.delete({ user });
    }

    async deleteOneRefreshTokenByValue(value: string) {
        await this.refreshTokenRepository.delete({ value });
    }

    extractTokensFromCookies(req: Request) {
        if (!req.signedCookies) {
            return null;
        }

        const result: { access_token: string | null, refresh_token: string | null } = {
            access_token: null,
            refresh_token: null,
        };

        if (req.signedCookies.access_token) {
            result.access_token = req.signedCookies.access_token as string;
        }
        if (req.signedCookies.refresh_token) {
            result.refresh_token = req.signedCookies.refresh_token as string;
        }

        return result;
    }
}
