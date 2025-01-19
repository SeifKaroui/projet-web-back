import { IsNumber, IsString } from 'class-validator';

export class RejectAbsenceJustificationDto {
  @IsString()
  teacherId: string;

  @IsNumber()
  absenceId: number;
}