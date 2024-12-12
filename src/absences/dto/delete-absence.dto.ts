import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID } from 'class-validator';

export class DeleteAbsenceDto {
 @IsInt()
  absenceId: number; 
}
