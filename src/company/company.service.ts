import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { ICompany } from './company.schema';
import { COMPANY_PROVIDER_TOKEN } from './company.constants';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { IPageinatedDataTable } from 'src/app/interfaces';
import { Role } from 'src/roles/roles.schema';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(COMPANY_PROVIDER_TOKEN)
    private companyModel: Model<ICompany>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: { userId?: ObjectId }): Promise<ICompany> {
    const company = new this.companyModel({
      ...createCompanyDto,
      created_by: user?.userId,
    });
    
    const savedCompany = await company.save();

  

    return savedCompany;
  }

  async getCompanyById(id) {
    return await this.companyModel
      .findOne({ _id: id,is_deleted: false });
  }

  async getCompanyByIdForLogin(id) {
    return await this.companyModel
      .findOne({ _id: id});
  }


  async findAll(rpp: number, page: number, filter: object, orderBy): Promise<IPageinatedDataTable> {
    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.companyModel.countDocuments({ ...filter, is_deleted: false });
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const companies = await this.companyModel
      .find({ ...filter, is_deleted: false })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

    return { pages: `Page ${page} of ${totalPages}`, total: totalDocuments, data: companies };
  }

  async findOne(id): Promise<ICompany> {
    const company = await this.companyModel
      .findOne({ _id: id, is_deleted: false })
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }



  async getPaginatedCompanies(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
  

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.companyModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const companies = await this.companyModel
      .find(filter, {  updated_at: 0, __v: 0,  updated_by: 0 })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

    return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: companies };
  }



  /**
   *The purpose of this method is to return bandCategory based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns bandCategory based on filter
   */
  async getFilteredCompanies($filter: Object, $orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    console.log($filter)

    return await this.companyModel
      .find($filter, {  updated_at: 0, __v: 0, updated_by: 0 })
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto | { created_by: ObjectId }): Promise<ICompany> {
    const company = await this.companyModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        { $set: updateCompanyDto },
        { new: true }
      )
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async remove(id: string): Promise<ICompany> {
    const company = await this.companyModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        { is_deleted: true },
        { new: true }
      );

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async findByUserId(user) {
    console.log('fucking wrong-----', user)
    const company = await this.companyModel.find()
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
} 