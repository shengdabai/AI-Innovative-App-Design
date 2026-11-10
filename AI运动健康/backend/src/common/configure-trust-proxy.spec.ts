import { Controller, Get } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { configureTrustProxy } from './configure-trust-proxy';

@Controller()
class ProbeController {
  @Get()
  probe() {
    return { ok: true };
  }
}

describe('proxy-aware rate limiting', () => {
  let app: NestExpressApplication;

  async function start(trustProxy?: string) {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 1 }])],
      controllers: [ProbeController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
    configureTrustProxy(app, trustProxy);
    await app.init();
    return request(app.getHttpServer());
  }

  afterEach(async () => {
    await app?.close();
  });

  it.each(['1', '127.0.0.1, ::1/128'])('isolates forwarded clients with TRUST_PROXY=%s', async (value) => {
    const http = await start(value);
    await http.get('/').set('X-Forwarded-For', '192.0.2.1').expect(200);
    await http.get('/').set('X-Forwarded-For', '192.0.2.2').expect(200);
    await http.get('/').set('X-Forwarded-For', '192.0.2.1').expect(429);
  });

  it.each([undefined, '', 'false', '0', '192.0.2.0/24'])('ignores spoofed headers with TRUST_PROXY=%s', async (value) => {
    const http = await start(value);
    await http.get('/').set('X-Forwarded-For', '192.0.2.1').expect(200);
    await http.get('/').set('X-Forwarded-For', '192.0.2.2').expect(429);
  });

  it('trusts only the configured hop even if the client prepends a spoofed address', async () => {
    const http = await start('1');
    await http.get('/').set('X-Forwarded-For', '192.0.2.99, 192.0.2.1').expect(200);
    await http.get('/').set('X-Forwarded-For', '192.0.2.98, 192.0.2.1').expect(429);
  });

  it.each(['true', '-1', '1.5', '9007199254740992', ',', 'invalid-proxy'])('rejects invalid TRUST_PROXY=%s', async (value) => {
    await expect(start(value)).rejects.toThrow();
  });
});
