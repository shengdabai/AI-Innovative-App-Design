import { ArrayMaxSize, IsArray, IsNumber, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @IsString()
  @Length(1, 100)
  category: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  servingUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  servingSize?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags?: string[];
}
