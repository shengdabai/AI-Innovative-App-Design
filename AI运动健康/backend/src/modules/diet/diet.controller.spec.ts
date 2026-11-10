// The service module is replaced so the test needs neither a generated Prisma
// client nor image-recognition credentials; only the controller and Nest's pipes are real.
jest.mock('./diet.service', () => ({ DietService: class DietService {} }));

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DietController } from './diet.controller';
import { DietService } from './diet.service';
import { createControllerTestApp, TEST_USER_ID } from '../../common/testing/controller-test-app';

describe('DietController query parameters', () => {
  let app: INestApplication;
  const dietService = {
    getMealRecords: jest.fn(async () => ({ records: [], total: 0 })),
    getDietTrends: jest.fn(async () => []),
    updateMealRecord: jest.fn(async () => ({ id: 'meal-1' })),
  };

  beforeAll(async () => {
    app = await createControllerTestApp(DietController, [{ provide: DietService, useValue: dietService }]);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['userId', 'id', 'user', 'totalCalories'])('rejects the protected update field %s', async (field) => {
    await request(app.getHttpServer()).put('/diet/meals/meal-1')
      .send({ notes: 'Lunch', [field]: 'attacker-controlled' }).expect(400);
    expect(dietService.updateMealRecord).not.toHaveBeenCalled();
  });

  it('accepts a partial update without requiring mealType', async () => {
    await request(app.getHttpServer()).put('/diet/meals/meal-1')
      .send({ notes: 'Lunch' }).expect(200);
    expect(dietService.updateMealRecord).toHaveBeenCalledWith(TEST_USER_ID, 'meal-1', { notes: 'Lunch' });
  });

  it('validates provided update fields', async () => {
    await request(app.getHttpServer()).put('/diet/meals/meal-1')
      .send({ mealType: 'INVALID' }).expect(400);
    expect(dietService.updateMealRecord).not.toHaveBeenCalled();
  });

  it('GET /diet/meals uses page 1 and limit 20 when both are omitted', async () => {
    await request(app.getHttpServer()).get('/diet/meals').expect(200);
    expect(dietService.getMealRecords).toHaveBeenCalledWith(
      TEST_USER_ID,
      expect.objectContaining({ page: 1, limit: 20, startDate: undefined, endDate: undefined, mealType: undefined }),
    );
  });

  it('GET /diet/meals passes provided page and limit as numbers', async () => {
    await request(app.getHttpServer()).get('/diet/meals?page=3&limit=5&mealType=LUNCH').expect(200);
    expect(dietService.getMealRecords).toHaveBeenCalledWith(
      TEST_USER_ID,
      expect.objectContaining({ page: 3, limit: 5, mealType: 'LUNCH' }),
    );
  });

  it('GET /diet/meals keeps the other default when only one value is provided', async () => {
    await request(app.getHttpServer()).get('/diet/meals?page=2').expect(200);
    expect(dietService.getMealRecords).toHaveBeenCalledWith(
      TEST_USER_ID,
      expect.objectContaining({ page: 2, limit: 20 }),
    );
  });

  it('GET /diet/trends uses 30 days when days is omitted', async () => {
    await request(app.getHttpServer()).get('/diet/trends').expect(200);
    expect(dietService.getDietTrends).toHaveBeenCalledWith(TEST_USER_ID, 30);
  });

  it('GET /diet/trends passes provided days as a number', async () => {
    await request(app.getHttpServer()).get('/diet/trends?days=7').expect(200);
    expect(dietService.getDietTrends).toHaveBeenCalledWith(TEST_USER_ID, 7);
  });

  // main.ts registers a global ValidationPipe with transform: true. It turns a
  // non-numeric query value into NaN before the route pipes run, and
  // DefaultValuePipe treats NaN like a missing value, so the default applies.
  it('GET /diet/trends falls back to 30 days for a non-numeric days value', async () => {
    await request(app.getHttpServer()).get('/diet/trends?days=week').expect(200);
    expect(dietService.getDietTrends).toHaveBeenCalledWith(TEST_USER_ID, 30);
  });
});
