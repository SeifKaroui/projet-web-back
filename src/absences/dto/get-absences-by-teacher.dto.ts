import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetAbsencesByTeacherDto {
  @Type(() => Number)
  @IsInt()
  courseId?: number;

}
