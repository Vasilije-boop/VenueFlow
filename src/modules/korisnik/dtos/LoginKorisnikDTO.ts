import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginKorisnikDTO {
    @IsString()
    @IsNotEmpty()
    Username: string;
    
    @IsString()
    @IsNotEmpty()
    Password: string;
}