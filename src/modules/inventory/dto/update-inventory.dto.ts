
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNumber, IsOptional, IsPositive, MaxLength, IsString } from 'class-validator';
import { CreateInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    codigo_barra?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    precio_unitario?: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
