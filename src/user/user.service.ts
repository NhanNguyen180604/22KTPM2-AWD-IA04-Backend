import { ConflictException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'node_modules/bcryptjs';
import { UserRoleEnum } from './user-role.enum';
import { TokenService } from 'src/token/token.service';

export const blacklistTokens = new Set<string>();

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @Inject(forwardRef(() => TokenService)) private readonly tokenService: TokenService,
    ) { }

    findOneBy(field: "id" | "email", value: number | string) {
        return this.usersRepository.findOneBy({
            [field]: value,
        });
    }

    async login(dto: LoginDto): Promise<{ access_token: string, refresh_token?: string }> {
        const foundUser = await this.findOneBy('email', dto.email);
        if (!foundUser || !bcrypt.compareSync(dto.password, foundUser.password)) {
            throw new UnauthorizedException("Invalid login credentials");
        }
        return this.createTokens(foundUser, dto.rememberMe);
    }

    async register(dto: RegisterDto) {
        const duplicateEmailUser = await this.findOneBy('email', dto.email);
        if (duplicateEmailUser) {
            throw new ConflictException(`User with this email "${dto.email}" already exists`);
        }

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(dto.password, salt);
        let newUser = this.usersRepository.create({
            email: dto.email,
            password: hashedPassword,
            role: UserRoleEnum.USER,
        });

        newUser = await this.usersRepository.save(newUser);
        return this.createTokens(newUser, dto.rememberMe);
    }

    logout(user: User) {
        this.tokenService.deleteOneRefreshTokenByUser(user);    
    }

    async createTokens(user: User, rememberMe: boolean) {
        const access_token = await this.tokenService.createOneAccessToken(user);

        if (rememberMe) {
            const refresh_token = await this.tokenService.createOneRefreshToken(user);
            return { access_token, refresh_token };
        }

        return { access_token };
    }
}
