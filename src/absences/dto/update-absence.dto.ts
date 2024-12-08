import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAbsenceDto {
  @IsBoolean()

  
  justified: boolean;
}
