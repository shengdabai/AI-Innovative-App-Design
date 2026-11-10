import { PartialType } from '@nestjs/swagger';
import { CreateMealRecordDto } from './create-meal-record.dto';

// A concrete class preserves validation metadata at the HTTP boundary.
export class UpdateMealRecordDto extends PartialType(CreateMealRecordDto) {}
