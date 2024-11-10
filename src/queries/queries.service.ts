import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateQueryDto } from './dtos/create-queries.dto';
import { QUERY_PROVIDER_TOKEN } from './queries.constants';
import { IQuery } from './queries.schema';
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


    async updateOption(id, body: UpdateQueryDto, user: { userId?: ObjectId }) {

        const {
            first_name,
            last_name,
            is_mobile,
            email,
            query,
            is_deleted,
            is_disabled,
            status
        } = body;

        const screenExits = await this.queryModel.findOne({ _id: id, is_deleted: false })

        if (!screenExits) {
            throw new BadRequestException('Invalid screen id')
        }

        const screen = await this.queryModel.findByIdAndUpdate({ _id: screenExits._id },
            {
                first_name,
                last_name,
                email,
                query,
                is_mobile,
                is_deleted,
                is_disabled,
                status,
                updated_by: user?.userId || null
            }, { new: true })


        return screen

    }

}
