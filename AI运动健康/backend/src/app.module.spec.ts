import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import KeyvRedis from '@keyv/redis';
import { AppModule } from './app.module';
import { PrismaService } from './modules/prisma/prisma.service';

// Resolves the whole module graph without a database or Redis: PrismaService is
// stubbed, and the Keyv Redis store only connects on first cache access.
describe('AppModule wiring', () => {
  const savedEnv = { ...process.env };
  let moduleRef: TestingModule;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'fixture-only-jwt-secret';
    delete process.env.JWT_EXPIRES_IN;
    moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  afterAll(async () => {
    await moduleRef?.close();
    process.env = savedEnv;
  });

  it('signs access tokens with the default 7d lifetime', () => {
    const jwt = moduleRef.get(JwtService);
    const { iat, exp } = jwt.decode(jwt.sign({ sub: 'user-1' }));
    expect(exp - iat).toBe(7 * 24 * 60 * 60);
  });

  it('registers the cache manager with the Keyv Redis store', () => {
    const cache = moduleRef.get(CACHE_MANAGER);
    expect(cache.stores).toHaveLength(1);
    expect(cache.stores[0].opts.store).toBeInstanceOf(KeyvRedis);
  });

  it('enforces the configured rate limit with a global ThrottlerGuard', () => {
    const providers: unknown[] = Reflect.getMetadata('providers', AppModule) ?? [];
    expect(providers).toContainEqual({ provide: APP_GUARD, useClass: ThrottlerGuard });
  });
});
