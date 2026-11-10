import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('send')
  @ApiOperation({ summary: '发送消息' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.chat(userId, dto.message);
  }

  @Get('history')
  @ApiOperation({ summary: '获取聊天历史' })
  async getChatHistory(
    @CurrentUser('id') userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.chatService.getChatHistory(userId, limit);
  }

  @Delete('history')
  @ApiOperation({ summary: '清除聊天历史' })
  async clearChatHistory(@CurrentUser('id') userId: string) {
    return this.chatService.clearChatHistory(userId);
  }

  @Get('suggestions')
  @ApiOperation({ summary: '获取快捷建议' })
  async getSuggestions(@CurrentUser('id') userId: string) {
    return this.chatService.getSuggestions(userId);
  }
}
