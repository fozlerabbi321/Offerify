import { MultipartFile } from '@fastify/multipart';
import * as fs from 'fs-extra';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

export class FileUploadUtil {
    static async saveFile(file: MultipartFile, folder: string): Promise<string> {
        const uploadDir = join(process.cwd(), 'uploads', folder);
        await fs.ensureDir(uploadDir);

        const fileExt = extname(file.filename);
        const fileName = `${randomUUID()}${fileExt}`;
        const filePath = join(uploadDir, fileName);

        const buffer = await file.toBuffer();
        await fs.writeFile(filePath, buffer);

        return `/public/${folder}/${fileName}`; // Return relative public path
    }
}
