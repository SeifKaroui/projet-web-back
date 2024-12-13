import { IsString, IsDate, IsEnum, IsArray, IsOptional } from 'class-validator';

export enum InvitationType {
  CODE = 'code',
  EMAIL = 'email'
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

 

  @IsEnum(InvitationType)
  invitationType: InvitationType;

  @IsArray()
  @IsOptional()
  studentEmails?: string[];
}