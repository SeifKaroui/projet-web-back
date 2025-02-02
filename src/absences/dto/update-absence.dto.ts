import { IsOptional, IsString } from 'class-validator';

export class UpdateAbsenceDto {
  @IsString()
  @IsOptional()
  justification: string;
}
