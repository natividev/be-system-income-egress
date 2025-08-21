import { IsOptional, IsDateString } from 'class-validator';

export class RangeQueryDto {
    @IsOptional()
    @IsDateString()
    from?: string; // '2025-08-01'

    @IsOptional()
    @IsDateString()
    to?: string;   // '2025-08-20'
}
