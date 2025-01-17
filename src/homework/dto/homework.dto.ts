import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { Upload } from 'src/uploads/entities/upload.entity';
import { Unique } from 'typeorm';

export class CreateHomeworkDTO {
  @IsNotEmpty()
  @IsString()
  @Unique(["title"])
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  deadline: string; // ISO 8601 date string

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  courseId: number;
  


}

export class UpdateHomeworkDTO {

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  
}

export class HomeworkResponseDTO {
  id: number;
  title: string;
  description: string;
  deadline: Date;
  createdAt: Date;
  files: Upload[];
}
