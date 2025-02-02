import { IsInt, IsUUID } from 'class-validator';

export class DeleteAbsenceDto {
 @IsInt()
  absenceId: number; 
}
