import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtOptionalGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('foods')
@Controller('foods')
@UseGuards(JwtOptionalGuard)
@ApiBearerAuth()
export class FoodsController {
  constructor(private foodsService: FoodsService) {}

  @Get('search')
  @ApiOperation({ summary: '搜索食物' })
  async searchFoods(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.foodsService.searchFoods(query, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取食物详情' })
  async getFood(@Param('id') id: string) {
    return this.foodsService.getFood(id);
  }

  @Get('categories/list')
  @ApiOperation({ summary: '获取食物分类列表' })
  async getCategories() {
    return this.foodsService.getCategories();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '添加新食物（用户贡献）' })
  async createFood(@Body() foodData: CreateFoodDto) {
    return this.foodsService.createFood(foodData);
  }
}
