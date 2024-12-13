import { IsString } from "class-validator";

export class JoinCourseDto {
    @IsString()
    code: string;
  }
  