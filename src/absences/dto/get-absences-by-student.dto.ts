import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetAbsencesByStudentDto {
  @Type(() => Number)
  @IsInt()
  courseId?: number;
}
