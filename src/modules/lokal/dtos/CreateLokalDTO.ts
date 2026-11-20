import { IsNotEmpty, IsString, IsEnum, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TipLokala } from '../enums/tipLokala.enum.js';

export class VlasnikUdeoDto {
    @IsString()
    @IsNotEmpty()
    Username: string;

    @IsNumber()
    @Min(1)
    @Max(100)
    Procenat: number;
}

export class CreateLokalDTO {
    @IsString()
    @IsNotEmpty()
    NazivLokala: string;
    
    @IsEnum(TipLokala)
    @IsNotEmpty()
    TipLokala: TipLokala;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VlasnikUdeoDto)
    @IsNotEmpty()
    Vlasnici: VlasnikUdeoDto[];
}