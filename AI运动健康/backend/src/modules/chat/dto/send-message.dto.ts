import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendMessageDto {
  // Preserve the raw value instead of implicitly coercing objects to strings.
  @Transform(({ obj }) => obj.message, { toClassOnly: true })
  @IsString()
  @Length(1, 4000)
  @Matches(/\S/, { message: 'message must contain non-whitespace text' })
  message: string;
}
