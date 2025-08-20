import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// Enum espejo del enum de Prisma (tipo_movimiento)
export enum TipoMovimiento {
    entrada = 'entrada',
    salida = 'salida',
    ajuste = 'ajuste',
}

export class CreateMovimientoDto {
    @IsEnum(TipoMovimiento)
    tipo!: TipoMovimiento;

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

    // quien ejecuta el movimiento (id del usuario del sistema)
    @IsInt()
    id_usuario!: number;
}
