// The service module is replaced so the test needs neither a generated Prisma
// client nor an OpenAI key; only the controller and Nest's pipes are real.
jest.mock('./chat.service', () => ({ ChatService: class ChatService {} }));

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { createControllerTestApp, TEST_USER_ID } from '../../common/testing/controller-test-app';

describe('ChatController query parameters', () => {
  let app: INestApplication;
  const chatService = {
    getChatHistory: jest.fn(async () => []),
    chat: jest.fn(async () => ({ message: 'OK' })),
  };

  beforeAll(async () => {
    app = await createControllerTestApp(ChatController, [{ provide: ChatService, useValue: chatService }]);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([{}, { message: '' }, { message: '   ' }, { message: {} }, { message: 123 }, { message: false }, { message: [] }, { message: 'x'.repeat(4001) }])(
    'rejects invalid chat input before calling the service', async (body) => {
      await request(app.getHttpServer()).post('/chat/send').send(body).expect(400);
      expect(chatService.chat).not.toHaveBeenCalled();
    },
  );

  it('passes a valid message and authenticated user to the service', async () => {
    await request(app.getHttpServer()).post('/chat/send').send({ message: 'Hello' }).expect(201);
    expect(chatService.chat).toHaveBeenCalledWith(TEST_USER_ID, 'Hello');
  });

  it('GET /chat/history uses limit 50 when limit is omitted', async () => {
    await request(app.getHttpServer()).get('/chat/history').expect(200);
    expect(chatService.getChatHistory).toHaveBeenCalledWith(TEST_USER_ID, 50);
  });

  it('GET /chat/history passes a provided limit as a number', async () => {
    await request(app.getHttpServer()).get('/chat/history?limit=10').expect(200);
    expect(chatService.getChatHistory).toHaveBeenCalledWith(TEST_USER_ID, 10);
  });

  // main.ts registers a global ValidationPipe with transform: true. It turns a
  // non-numeric query value into NaN before the route pipes run, and
  // DefaultValuePipe treats NaN like a missing value, so the default applies.
  it('GET /chat/history falls back to limit 50 for a non-numeric limit', async () => {
    await request(app.getHttpServer()).get('/chat/history?limit=abc').expect(200);
    expect(chatService.getChatHistory).toHaveBeenCalledWith(TEST_USER_ID, 50);
  });
});
