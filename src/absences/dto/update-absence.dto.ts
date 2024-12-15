import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAbsenceDto {
  @IsString()
  @IsOptional()
  justification: string; 
}
