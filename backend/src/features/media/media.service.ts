import { Injectable } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import * as fs from 'fs-extra';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
    private readonly uploadDir = join(process.cwd(), 'uploads');

    async uploadFile(file: MultipartFile): Promise<{ url: string }> {
        await fs.ensureDir(this.uploadDir);

        const fileExt = extname(file.filename);
        const fileName = `${randomUUID()}${fileExt}`;
        const filePath = join(this.uploadDir, fileName);

        const buffer = await file.toBuffer();
        await fs.writeFile(filePath, buffer);

        return { url: `/public/${fileName}` };
    }
}
