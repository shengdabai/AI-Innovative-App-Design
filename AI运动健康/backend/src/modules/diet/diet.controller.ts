import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DietService } from './diet.service';
import { CreateMealRecordDto } from './dto/create-meal-record.dto';
import { UpdateMealRecordDto } from './dto/update-meal-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserInfo } from '../../common/decorators/user.decorator';

@ApiTags('diet')
@Controller('diet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DietController {
  constructor(private dietService: DietService) {}

  @Post('meals')
  @ApiOperation({ summary: '创建饮食记录' })
  @UseInterceptors(FileInterceptor('image'))
  async createMealRecord(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMealRecordDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.dietService.createMealRecord(userId, dto, image);
  }

  @Get('meals')
  @ApiOperation({ summary: '获取饮食记录列表' })
  async getMealRecords(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('mealType') mealType?: string,
  ) {
    return this.dietService.getMealRecords(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      mealType: mealType as any,
      page,
      limit,
    });
  }

  @Get('meals/:id')
  @ApiOperation({ summary: '获取单条饮食记录' })
  async getMealRecord(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.dietService.getMealRecord(userId, id);
  }

  @Put('meals/:id')
  @ApiOperation({ summary: '更新饮食记录' })
  async updateMealRecord(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMealRecordDto,
  ) {
    return this.dietService.updateMealRecord(userId, id, dto);
  }

  @Delete('meals/:id')
  @ApiOperation({ summary: '删除饮食记录' })
  async deleteMealRecord(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.dietService.deleteMealRecord(userId, id);
  }

  @Get('summary/:date')
  @ApiOperation({ summary: '获取每日饮食汇总' })
  async getDailySummary(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.dietService.getDailySummary(userId, new Date(date));
  }

  @Get('summary')
  @ApiOperation({ summary: '获取今日饮食汇总' })
  async getTodaySummary(@CurrentUser('id') userId: string) {
    return this.dietService.getDailySummary(userId, new Date());
  }

  @Get('trends')
  @ApiOperation({ summary: '获取饮食趋势分析' })
  async getDietTrends(
    @CurrentUser('id') userId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.dietService.getDietTrends(userId, days);
  }

  @Get('advice')
  @ApiOperation({ summary: '获取营养建议' })
  async getNutritionAdvice(@CurrentUser('id') userId: string) {
    return this.dietService.getNutritionAdvice(userId);
  }

  @Post('recognize')
  @ApiOperation({ summary: '识别食物图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async recognizeFood(@UploadedFile() image: Express.Multer.File) {
    // 这里直接调用图像识别，不创建记录
    return { message: '图片识别功能需要配置API Key' };
  }
}
