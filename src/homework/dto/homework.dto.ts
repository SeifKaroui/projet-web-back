import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateHomeworkDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  deadline: string; // ISO 8601 date string

  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}

export class UpdateHomeworkDTO {
  @IsNumber()
  homeworkId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsNumber()
  courseId?: number;
}

export class HomeworkResponseDTO {
  id: number;
  title: string;
  description: string;
  deadline: Date;
  createdAt: Date;
  course: {
    id: number;
    title: string;
  };
  submissions: {
    id: number;
    student: {
      id: number;
      name: string;
    };
    submittedAt: Date;
    grade?: number;
  }[];
}
