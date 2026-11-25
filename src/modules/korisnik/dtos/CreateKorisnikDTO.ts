import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateKorisnikDTO {
    @IsString()
    @IsNotEmpty()
    Ime: string;
    
    @IsString()
    @IsNotEmpty()
    Prezime: string;

    @IsEmail({}, { message: 'Email adresa nije u ispravnom formatu'})
    Email: string;

    @IsString()
    @IsNotEmpty()
    Username: string;

    @IsString()
    @MinLength(8,{ message: "Minimalna duzina sifre je 8 karaktera!"})
    Sifra: string;

    @IsString()
    BrojTelefona: string;
}