import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { logTransaction } from '@app/log/schemas/log.schema';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  group: string;

  @IsArray()
  @IsNotEmpty()
  transaction: logTransaction[];
}
