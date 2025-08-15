import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { INotification } from './notifications.schema';
import { NOTIFICATIONS_PROVIDER_TOKEN } from './notifications.constants';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { IPageinatedDataTable } from 'src/app/interfaces';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_PROVIDER_TOKEN)
    private notificationModel: Model<INotification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, user: { userId?: ObjectId }): Promise<INotification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      created_by: user?.userId,
    });
    
    const savedNotification = await notification.save();
    return savedNotification;
  }

  async getNotificationById(id) {
    return await this.notificationModel
      .findOne({ _id: id, is_deleted: false });
  }

  async findAll(rpp: number, page: number, filter: object, orderBy): Promise<IPageinatedDataTable> {
    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.notificationModel.countDocuments({ ...filter, is_deleted: false });
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const notifications = await this.notificationModel
      .find({ ...filter, is_deleted: false })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

    return { pages: `Page ${page} of ${totalPages}`, total: totalDocuments, data: notifications };
  }

  async findOne(id): Promise<INotification> {
    const notification = await this.notificationModel
      .findOne({ _id: id, is_deleted: false })
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async getPaginatedNotifications(rpp: number, page: number, filter: Object, orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.notificationModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const notifications = await this.notificationModel
      .find(filter, { updated_at: 0, __v: 0, updated_by: 0 })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

    return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: notifications };
  }

  /**
   * The purpose of this method is to return notifications based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns notifications based on filter
   */
  async getFilteredNotifications($filter: Object, $orderBy, user: { userId?: ObjectId, company_id?: ObjectId }) {
    console.log($filter)

    return await this.notificationModel
      .find($filter, { updated_at: 0, __v: 0, updated_by: 0 })
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto | { created_by: ObjectId }): Promise<INotification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        { $set: updateNotificationDto },
        { new: true }
      )
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email',
      });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async remove(id: string): Promise<INotification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        { is_deleted: true },
        { new: true }
      );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async findByUserId(user) {
    console.log('finding notifications for user-----', user)
    const notifications = await this.notificationModel.find()
    
    if (!notifications) {
      throw new NotFoundException('Notifications not found');
    }
    return notifications;
  }
} 