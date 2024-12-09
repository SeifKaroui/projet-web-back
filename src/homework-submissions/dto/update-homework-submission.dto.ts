import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateHomeworkSubmissionDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  grade: number;

  @IsString()
  @IsNotEmpty()
  feedback: string;
}