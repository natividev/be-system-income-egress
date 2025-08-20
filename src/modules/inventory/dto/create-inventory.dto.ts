import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateInventoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre!: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    codigo_barra?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    precio_unitario!: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    stock_actual?: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;

    @IsInt()
    id_categoria!: number;

    @IsInt()
    id_unidad_medida!: number;
}
