import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('suggestions')
    @ApiOperation({ summary: 'Get search suggestions' })
    @ApiQuery({ name: 'q', required: true, type: String })
    @ApiQuery({ name: 'cityId', required: false, type: Number })
    async getSuggestions(
        @Query('q') q: string,
        @Query('cityId') cityId?: string,
    ) {
        return this.searchService.getSuggestions(q, cityId ? parseInt(cityId) : undefined);
    }
}
