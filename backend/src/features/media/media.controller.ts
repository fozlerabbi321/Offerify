import { Controller, Post, Req, UseInterceptors, Body } from '@nestjs/common';
import { MediaService } from './media.service';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Media')
@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @ApiOperation({ summary: 'Upload a file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    async uploadFile(@Req() req: FastifyRequest) {
        const file = await req.file();
        if (!file) {
            throw new Error('File is required');
        }
        return this.mediaService.uploadFile(file);
    }
}
