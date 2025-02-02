import { IsUUID, IsDateString, IsBoolean, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateAbsenceDto {

  @IsUUID()
  studentId: string; 


  @IsInt()
  courseId: number; 


  @IsDateString()
  date: string; 
  

  @IsBoolean()
  justified: boolean;

  @IsString()
  @IsOptional()
  justification: string; 
}
