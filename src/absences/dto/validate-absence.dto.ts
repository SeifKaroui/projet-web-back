import { IsBoolean} from 'class-validator';

export class ValidateAbsenceDto {
  @IsBoolean()
  justified: boolean;
}
