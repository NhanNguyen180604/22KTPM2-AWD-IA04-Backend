import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsString } from "class-validator";

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
    @IsBoolean({
        message: "The field Remember Me must be a boolean",
    })
    rememberMe: boolean;
}