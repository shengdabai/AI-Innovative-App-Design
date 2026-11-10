import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DietModule } from './modules/diet/diet.module';
import { MenuModule } from './modules/menu/menu.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ChatModule } from './modules/chat/chat.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { FoodsModule } from './modules/foods/foods.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // 配置模块 - 全局加载
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // 缓存模块
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      // cache-manager v7 uses Keyv stores; the Redis adapter connects on first use.
      useFactory: (configService: ConfigService) => ({
        stores: [
          new KeyvRedis({
            socket: {
              host: configService.get<string>('REDIS_HOST', 'localhost'),
              port: Number(configService.get('REDIS_PORT', 6379)),
            },
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          }),
        ],
        ttl: 300 * 1000, // 5 minutes, in milliseconds
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([{
        // Env values arrive as strings; coerce so the limit compares as a number.
        ttl: Number(configService.get('THROTTLE_TTL', 60)) * 1000,
        limit: Number(configService.get('THROTTLE_LIMIT', 100)),
      }]),
      inject: [ConfigService],
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 业务模块
    PrismaModule,
    AuthModule,
    UsersModule,
    DietModule,
    MenuModule,
    AnalyticsModule,
    ChatModule,
    AchievementsModule,
    FoodsModule,
    RecipesModule,
    HealthModule,
  ],
  providers: [
    // ThrottlerModule only defines limits; this guard enforces them on every route.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
