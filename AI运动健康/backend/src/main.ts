import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureTrustProxy } from './common/configure-trust-proxy';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Express 5 (Nest 11) defaults to the "simple" query parser, which does not
  // parse bracket syntax: ?taste[]=A&taste[]=B would arrive as a "taste[]" key.
  // Keep the Express 4 "extended" (qs) parser. The controller test helper
  // (src/common/testing/controller-test-app.ts) sets the same parser.
  app.set('query parser', 'extended');

  const configService = app.get(ConfigService);
  configureTrustProxy(app, configService.get<string>('TRUST_PROXY'));

  // 全局前缀
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // CORS配置
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:19006');
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:19006', 'exp://localhost:19000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('AI Fitness Coach API')
    .setDescription('AI智能私教后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关')
    .addTag('users', '用户管理')
    .addTag('diet', '饮食记录')
    .addTag('menu', '菜单计划')
    .addTag('analytics', '数据分析')
    .addTag('chat', 'AI对话')
    .addTag('achievements', '成就系统')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap();
