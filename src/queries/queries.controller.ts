import { Controller, Get, Post, Body, Query, Req, UseGuards, Put } from '@nestjs/common';
import getMessages from 'src/app/api-messages';
import { ApiTags, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { QueriesService } from './queries.service';
import { CreateQueryDto } from './dtos/create-queries.dto';
import { UpdateQueryDto } from './dtos/update-queries.dto';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';
import { RolesGuard } from 'src/app/guards/role-guard';
import { QueryParamsDTO } from 'src/app/dtos/query-params.dto';
import { ParamsHandler } from 'src/app/custom-decorators/params-handler.decorator';
import { IPaginationQuery } from 'src/app/interfaces';

const { RESOURCE_CREATED } = getMessages('query(s)');


@Controller('queries')
@ApiTags('queries')
export class QueriesController {

    constructor(private quiriesService: QueriesService) { }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.INTERNAL_ADMIN)
    @Get()
    @ApiQuery({ type: QueryParamsDTO })
    async getUserList(@ParamsHandler() pagination: IPaginationQuery) {
        const { $rpp, $page, $filter, $orderBy } = pagination;
        if ($rpp && $page) {
            const result = await this.quiriesService.getPaginatedUsers($rpp, $page, $filter, $orderBy);
            return {
                status: result ? true : false,
                statusCode: result ? 200 : 400,
                message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
                data: result ? result : null
            }
        }
        const result = await this.quiriesService.getFilteredUsers($filter, $orderBy);
        return {
            status: result ? true : false,
            statusCode: result ? 200 : 400,
            message: result ? 'Result of query fetched successfully' : 'Something went wrong with parameters, Kindly have a look and try again',
            data: result ? result : null
        }
    }



    @Post()
    @ApiBody({ type: CreateQueryDto })
    async insert(@Body() body: CreateQueryDto, @Req() req: Request) {
        const createOption = await this.quiriesService.insertOption(body);
        return { message: 'Your message has been sent successfully', data: createOption };
    }

    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Put()
    @ApiBody({ type: UpdateQueryDto })
    async update(@Query('id') id: string, @Body() body: UpdateQueryDto, @Req() req: Request) {
        const createOption = await this.quiriesService.updateOption(id, body, req.user);
        return { message: 'Query updated successfully', data: createOption };
    }


}
