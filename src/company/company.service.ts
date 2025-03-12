import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { ICompany } from './company.schema';
import { COMPANY_PROVIDER_TOKEN } from './company.constants';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { IPageinatedDataTable } from 'src/app/interfaces';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(COMPANY_PROVIDER_TOKEN)
    private companyModel: Model<ICompany>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user:{userId?: ObjectId}): Promise<ICompany> {
    const company = new this.companyModel({
      ...createCompanyDto,
      created_by: user?.userId,
    });
    return await company.save();
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

  async findOne(id: string): Promise<ICompany> {
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

  async findByUserId(user): Promise<ICompany> {
    console.log('user-----', user)
    const company = await this.companyModel
      .findOne({  is_deleted: false })
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
} 