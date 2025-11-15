import { Body, Controller, Inject, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dtos/login.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dtos/register.dto';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.userService.login(loginDto);

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

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.userService.register(registerDto);

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

    @UseGuards(JwtGuard)
    @Get('me')
    async getMe(@Req() req: Request) {
        return {
            id: req.user!.id,
            email: req.user!.email,
        }
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        this.userService.logout(req.user!);
        return { message: "Logged out" };
    }
}
