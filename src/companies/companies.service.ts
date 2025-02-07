import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { Model, ObjectId } from 'mongoose';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { COMPANIES_PROVIDER_TOKEN } from './companies.constant';
import { ICompanies } from './companies.schema';
import { IPageinatedDataTable } from 'src/app/interfaces';
import { SystemUsersService } from 'src/system-users/system-users.service';
import { ErrorMessages } from 'src/app/error-messages';

@Injectable()
export class CompaniesService {

    constructor(
        @Inject(COMPANIES_PROVIDER_TOKEN)
        private companyModel: Model<ICompanies>,
        @Inject(forwardRef(() => SystemUsersService))
        private systemUserService: SystemUsersService
    ) { }


    async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy) {
        const skip: number = (page - 1) * rpp;
        const totalDocuments: number = await this.companyModel.countDocuments(filter);
        const totalPages: number = Math.ceil(totalDocuments / rpp);
        page = page > totalPages ? totalPages : page;

        const bandCategorySection = await this.companyModel
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
        return await this.companyModel
            .find($filter, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
            .sort($orderBy)

    }

    async getCompanyById(id) {

        return await this.companyModel.findOne({ _id: id, is_deleted: false })

    }

    async getCompanyAdminsForCompanyByIdPaginated($rpp, $page, $filter, $orderBy, user) {



        return await this.systemUserService.getCompanyAdminsPaginated($rpp, $page, $filter, $orderBy, user)


    }

    async getCompanyAdminsForCompanyById($filter, $orderBy, user) {



        return await this.systemUserService.getCompanyAdminsFiltered($filter, $orderBy, user)


    }



    async insertCompany(body: CreateCompanyDto, user: { userId?: ObjectId }) {

        const { title, description, icon } = body;

        const screen = await new this.companyModel(
            {
                title,
                description,
                icon,
                created_by: user?.userId || null
            }).save();


        return screen

    }



    async updateComapny(id, body: UpdateCompanyDto, user: { userId?: ObjectId }) {
        const companyExists = await this.companyModel.findOne({ _id: id, is_deleted: false });

        if (!companyExists) {
            throw new BadRequestException(ErrorMessages.COMPANY_NOT_FOUND);
        }

        // Check if company name already exists (if title is being updated)
        if (body.title && body.title !== companyExists.title) {
            const existingCompany = await this.companyModel.findOne({ 
                title: body.title, 
                is_deleted: false,
                _id: { $ne: id }
            });
            
            if (existingCompany) {
                throw new BadRequestException(ErrorMessages.COMPANY_ALREADY_EXISTS);
            }
        }

        return await this.companyModel.findByIdAndUpdate(
            { _id: companyExists._id },
            {
                ...body,
                updated_by: user?.userId || null
            },
            { new: true }
        );
    }



}
