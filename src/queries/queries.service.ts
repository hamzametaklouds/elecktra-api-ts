import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateQueryDto } from './dtos/create-queries.dto';
import { QUERY_PROVIDER_TOKEN } from './queries.constants';
import { IQuery, QueryStatus } from './queries.schema';
import { UpdateQueryDto } from './dtos/update-queries.dto';

@Injectable()
export class QueriesService {
    constructor(
        @Inject(QUERY_PROVIDER_TOKEN)
        private queryModel: Model<IQuery>
    ) { }


    async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy) {
        const skip: number = (page - 1) * rpp;
        const totalDocuments: number = await this.queryModel.countDocuments(filter);
        const totalPages: number = Math.ceil(totalDocuments / rpp);
        page = page > totalPages ? totalPages : page;

        const bandCategorySection = await this.queryModel
            .find(filter, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
            .sort(orderBy)
            .skip(skip)
            .limit(rpp)

        return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: bandCategorySection };

    }

    /**
     *The purpose of this method is to return bandCategory based on filter
     * @param $filter filter query as an argument
     * @param $orderBy orderby as an argument
     * @returns bandCategory based on filter
     */
    async getFilteredUsers($filter: Object, $orderBy) {
        return await this.queryModel
            .find($filter, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
            .sort($orderBy)

    }

    async getQueryReqs() {
        const pending_queries = await this.queryModel
            .countDocuments(
                {
                    status: QueryStatus.P,
                    is_deleted: false
                }
            )
        console.log(pending_queries)
        return pending_queries

    }

    async insertOption(body: CreateQueryDto) {

        const {
            first_name,
            last_name,
            email,
            is_mobile,
            query,
        } = body;

        const screen = await new this.queryModel(
            {
                first_name,
                last_name,
                is_mobile,
                email,
                query,
                // created_by: user?.userId || null
            }).save();


        return screen

    }


    async updateOption(id, body: UpdateQueryDto, user) {

        const {
            first_name,
            last_name,
            is_mobile,
            email,
            query,
            is_deleted,
            platform_access_status,
            is_disabled,
            status
        } = body;

        const screenExits = await this.queryModel.findOne({ _id: id, is_deleted: false })

        if (!screenExits) {
            throw new BadRequestException('Invalid screen id')
        }


        if (platform_access_status && user?.company_id) {
            throw new ForbiddenException('Company admin is not allowed to modify the platform access');
        }

        const screen = await this.queryModel.findByIdAndUpdate({ _id: screenExits._id },
            {
                first_name,
                last_name,
                email,
                query,
                is_mobile,
                platform_access_status,
                is_deleted,
                is_disabled,
                status,
                updated_by: user?.userId || null
            }, { new: true })


        return screen

    }

}
