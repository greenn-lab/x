import { IsInt, IsOptional } from 'class-validator';

export class UpdateMaxCountDto {
  @IsInt()
  @IsOptional()
  memberMaxCount?: number;

  @IsInt()
  @IsOptional()
  ownerMaxCount?: number;

  @IsInt()
  @IsOptional()
  guestMaxCount?: number;
}
