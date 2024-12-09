import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateHomeworkDTO {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  deadline: string; // ISO 8601 date string

  @IsNotEmpty()
  @IsNumber()
  teacherId: number;

  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}

export class UpdateHomeworkDTO {
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
  description: string;
  deadline: Date;
  createdAt: Date;
  teacher: {
    id: number;
    name: string;
  };
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
