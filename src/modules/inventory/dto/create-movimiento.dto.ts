import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateMovimientoDto {
    tipo?: number;

    @IsInt()
    @IsPositive()
    cantidad!: number;

    @IsString()
    @IsOptional()
    @MaxLength(150)
    referencia?: string;

    @IsString()
    @IsOptional()
    observacion?: string;

    @IsInt()
    id_producto!: number;

    @IsInt()
    id_usuario!: number;
}
