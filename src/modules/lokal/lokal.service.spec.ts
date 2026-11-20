import { Test, TestingModule } from '@nestjs/testing';
import { LokalService } from './lokal.service.js';

describe('LokalService', () => {
  let service: LokalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LokalService],
    }).compile();

    service = module.get<LokalService>(LokalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
