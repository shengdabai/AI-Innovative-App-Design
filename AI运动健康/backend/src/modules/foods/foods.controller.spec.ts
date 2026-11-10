// The service module is replaced so the test does not need a generated Prisma
// client or a database; only the controller and Nest's pipes are real.
jest.mock('./foods.service', () => ({ FoodsService: class FoodsService {} }));

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { createControllerTestApp } from '../../common/testing/controller-test-app';

describe('FoodsController request parameters', () => {
  let app: INestApplication;
  const foodsService = {
    searchFoods: jest.fn(async () => ({ items: [], total: 0 })),
    getFood: jest.fn(async (id: string) => ({ id })),
    createFood: jest.fn(async () => ({ id: 'food-1' })),
  };

  beforeAll(async () => {
    app = await createControllerTestApp(FoodsController, [{ provide: FoodsService, useValue: foodsService }]);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validFood = { name: 'Rice', category: 'grain', calories: 130, protein: 2.6, carbs: 28, fat: 0.3 };

  it('accepts a valid food contribution', async () => {
    await request(app.getHttpServer()).post('/foods/create').send(validFood).expect(201);
    expect(foodsService.createFood).toHaveBeenCalledWith(validFood);
  });

  it.each([{}, { id: 'chosen-id' }, { createdAt: '2000-01-01' }, { calories: -1 }, { tags: [{}] }])(
    'rejects invalid or protected food fields before reaching Prisma', async (extra) => {
      const body = Object.keys(extra).length ? { ...validFood, ...extra } : {};
      await request(app.getHttpServer()).post('/foods/create').send(body).expect(400);
      expect(foodsService.createFood).not.toHaveBeenCalled();
    },
  );

  it('GET /foods/search uses page 1 and limit 20 when both are omitted', async () => {
    await request(app.getHttpServer()).get('/foods/search?q=egg').expect(200);
    expect(foodsService.searchFoods).toHaveBeenCalledWith('egg', 1, 20);
  });

  it('GET /foods/search passes provided page and limit as numbers', async () => {
    await request(app.getHttpServer()).get('/foods/search?q=egg&page=3&limit=5').expect(200);
    expect(foodsService.searchFoods).toHaveBeenCalledWith('egg', 3, 5);
  });

  // main.ts registers a global ValidationPipe with transform: true. It turns a
  // non-numeric query value into NaN before the route pipes run, and
  // DefaultValuePipe treats NaN like a missing value, so the default applies.
  it('GET /foods/search falls back to page 1 and limit 20 for non-numeric values', async () => {
    await request(app.getHttpServer()).get('/foods/search?q=egg&page=abc&limit=xyz').expect(200);
    expect(foodsService.searchFoods).toHaveBeenCalledWith('egg', 1, 20);
  });

  it('GET /foods/search rejects a fractional page with 400', async () => {
    await request(app.getHttpServer()).get('/foods/search?q=egg&page=1.5').expect(400);
    expect(foodsService.searchFoods).not.toHaveBeenCalled();
  });

  it('GET /foods/:id reads the id from the path', async () => {
    const id = '0b7c2f8e-5d1a-4c3b-9e2f-1a2b3c4d5e6f';
    const res = await request(app.getHttpServer()).get(`/foods/${id}`).expect(200);
    expect(foodsService.getFood).toHaveBeenCalledWith(id);
    expect(res.body).toEqual({ id });
  });

  it('GET /foods/:id ignores an id in the query string', async () => {
    await request(app.getHttpServer()).get('/foods/path-id?id=query-id').expect(200);
    expect(foodsService.getFood).toHaveBeenCalledWith('path-id');
  });
});
