import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../../../../src/features/media/media.service';
import * as fs from 'fs-extra';
import { join } from 'path';

jest.mock('fs-extra');

describe('MediaService', () => {
    let service: MediaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MediaService],
        }).compile();

        service = module.get<MediaService>(MediaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadFile', () => {
        it('should save file and return public URL', async () => {
            const mockFile = {
                filename: 'test-image.png',
                toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-data')),
            };

            (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
            (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);

            const result = await service.uploadFile(mockFile as any);

            expect(result).toHaveProperty('url');
            expect(result.url).toMatch(/\/public\/.*\.png$/);
            expect(fs.ensureDir).toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalled();
        });
    });
});
