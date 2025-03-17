import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IIntegration } from './integrations.schema';
import { INTEGRATIONS_PROVIDER_TOKEN } from './integrations.constants';
import { CreateIntegrationDto } from './dtos/create-integration.dto';
import { UpdateIntegrationDto } from './dtos/update-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    @Inject(INTEGRATIONS_PROVIDER_TOKEN)
    private integrationModel: Model<IIntegration>,
  ) {}

  async create(createIntegrationDto: CreateIntegrationDto, user: { userId?: ObjectId }) {
    const integration = new this.integrationModel({
      ...createIntegrationDto,
      created_by: user.userId,
    });
    return await integration.save();
  }

  async getPaginatedIntegrations(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId }) {
    filter['is_deleted'] = false;

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.integrationModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const integrations = await this.integrationModel
      .find(filter)
      .populate({
        path: 'created_by',
        select: 'first_name last_name'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name'
      })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp);

    return { 
      pages: `Page ${page} of ${totalPages}`, 
      current_page: page, 
      total_pages: totalPages, 
      total_records: totalDocuments, 
      data: integrations 
    };
  }

  async getFilteredIntegrations(filter: Object, orderBy, user: { userId?: ObjectId }) {
    filter['is_deleted'] = false;

    return await this.integrationModel
      .find(filter)
      .populate({
        path: 'created_by',
        select: 'first_name last_name'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name'
      })
      .sort(orderBy);
  }

  async findOne(id: string) {
    const integration = await this.integrationModel
      .findOne({ _id: id, is_deleted: false })
      .populate({
        path: 'created_by',
        select: 'first_name last_name'
      })
      .populate({
        path: 'updated_by',
        select: 'first_name last_name'
      });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    return integration;
  }

  async update(id: string, updateIntegrationDto: UpdateIntegrationDto, user: { userId?: ObjectId }) {
    const integration = await this.integrationModel.findOne({ _id: id, is_deleted: false });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return await this.integrationModel.findByIdAndUpdate(
      id,
      {
        ...updateIntegrationDto,
        updated_by: user.userId,
      },
      { new: true }
    ).populate({
      path: 'created_by',
      select: 'first_name last_name'
    })
    .populate({
      path: 'updated_by',
      select: 'first_name last_name'
    });
  }

  async remove(id: string, user: { userId?: ObjectId }) {
    const integration = await this.integrationModel.findOne({ _id: id, is_deleted: false });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return await this.integrationModel.findByIdAndUpdate(
      id,
      {
        is_deleted: true,
        updated_by: user.userId,
      },
      { new: true }
    ).populate({
      path: 'created_by',
      select: 'first_name last_name'
    })
    .populate({
      path: 'updated_by',
      select: 'first_name last_name'
    });
  }
} 