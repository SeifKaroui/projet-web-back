import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateHomeworkSubmissionDto {

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  homeworkId: number;
}