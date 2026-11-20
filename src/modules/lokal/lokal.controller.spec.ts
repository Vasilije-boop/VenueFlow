import { Test, TestingModule } from '@nestjs/testing';
import { LokalController } from './lokal.controller.js';

describe('LokalController', () => {
  let controller: LokalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LokalController],
    }).compile();

    controller = module.get<LokalController>(LokalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
