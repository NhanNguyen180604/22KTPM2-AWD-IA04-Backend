import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { blacklistTokens, UserService } from './user.service';
import { LoginDto } from './dtos/login.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshTokenGuard } from 'src/guards/jwt-refresh_token.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    @Post('login')
    login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = this.userService.login(loginDto);

        res.cookie('access_token', result.access_token, {
            signed: true,
            httpOnly: true,
            maxAge: this.configService.get<number>("cookie.access_token_max_age"),
        });
        if (result.refresh_token) {
            res.cookie('refresh_token', result.refresh_token, {
                signed: true,
                httpOnly: true,
                maxAge: this.configService.get<number>("cookie.refresh_token_max_age"),
            });
        }
        return result;
    }

    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        res.cookie('access_token', '');
        res.cookie('refresh_token', '');

        if (!req.signedCookies)
            return;
        if (req.signedCookies.access_token) {
            blacklistTokens.add(req.signedCookies.access_token);
        }
        if (req.signedCookies.refresh_token) {
            blacklistTokens.add(req.signedCookies.refresh_token);
        }
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Get('refresh-token')
    refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user!;
        const payload = { sub: user.id, email: user.email };

        const access_token = this.jwtService.sign(payload, {
            secret: this.configService.get("jwt.access_token.secret"),
            expiresIn: this.configService.get("jwt.access_token.expires_in"),
        });
        res.cookie('access_token', access_token, {
            signed: true,
            httpOnly: true,
            maxAge: this.configService.get<number>("cookie.access_token_max_age"),
        });

        return { access_token };
    }
}
