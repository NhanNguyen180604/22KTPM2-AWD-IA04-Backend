import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsStrongPassword } from "class-validator";
import { Match } from "../../validators/match.decorator";

export class RegisterDto {
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        },
        {
            message: "Password should have a min length of 8, contain both lower and uppercase, be alpha-numeric and contain at least 1 symbol",
        },
    )
    password: string;

    @Match('password', { message: "Password does not match" })
    confirmPassword: string;

    @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
    @IsBoolean({
        message: "The field Remember Me must be a boolean",
    })
    rememberMe: boolean;
}