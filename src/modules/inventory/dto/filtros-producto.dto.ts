import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class FiltrosProductoDto extends PaginationDto {
    @IsOptional()
    @IsString()
    q?: string; // búsqueda por nombre o código de barra

    @IsOptional()
    @IsInt()
    id_categoria?: number;

    @IsOptional()
    @IsInt()
    id_unidad_medida?: number;

    @IsOptional()
    activo?: boolean;
}
