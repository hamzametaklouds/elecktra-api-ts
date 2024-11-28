import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { HostStatus, IUsers } from './users.schema';
import { USERS_PROVIDER_TOKEN } from './users.constants';
import { CreateUserDto } from './dtos/create-users.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { CreateHostUserDto } from 'src/users/dtos/create-host-user.dto';
import { UpdateHostDto } from './dtos/update-host.dto';
import { QueriesService } from 'src/queries/queries.service';
const bcrypt = require('bcryptjs');

const { RESOURCE_NOT_FOUND } = getMessages('users(s)');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_PROVIDER_TOKEN)
    private userModel: Model<IUsers>,
    private queriesService: QueriesService,
    private configService: ConfigService,
  ) { }

  async getUserByEmail(email: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ email: email, is_deleted: false });
  }

  async getHostAndPendingApprovals() {
    const pending_hosts = await this.userModel
      .countDocuments({ is_host: true, host_status: HostStatus.P });

    const query = await this.queriesService.getQueryReqs()

    return { pending_hosts: pending_hosts, pending_queries: query }

  }


  async getUserByUUID(uuid: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ uuid: uuid, is_deleted: false });
  }

  async getUserByPhoneNumber(phone_no: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ phone_no: phone_no, is_deleted: false })
  }

  async getUserById(id: ObjectId): Promise<IUsers> {
    return await this.userModel
      .findOne({ _id: id, is_deleted: false })
  }

  async getUserData(user: { userId?: ObjectId }): Promise<IUsers> {
    return await this.userModel
      .findOne({ _id: user.userId, is_deleted: false })
  }


  async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy) {
    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.userModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const bandCategorySection = await this.userModel
      .find(filter, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)

    return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: bandCategorySection };

  }

  async getPaginatedHostUsers(rpp: number, page: number, filter: Object, orderBy) {

    filter['is_host'] = true

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.userModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;


    const bandCategorySection = await this.userModel
      .find(filter, { first_name: 1, last_name: 1, email: 1, country_code: 1, phone_no: 1, host_status: 1, address: 1, is_host: 1, for_car: 1, for_stay: 1 })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)

    return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: bandCategorySection };

  }


  async getFilteredHostUsers($filter: Object, $orderBy) {

    $filter['is_host'] = true

    return await this.userModel
      .find($filter, { first_name: 1, last_name: 1, email: 1, host_status: 1, country_code: 1, phone_no: 1, address: 1, is_host: 1, for_car: 1, for_stay: 1 })
      .sort($orderBy)

  }


  /**
   *The purpose of this method is to return bandCategory based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns bandCategory based on filter
   */
  async getFilteredUsers($filter: Object, $orderBy) {
    return await this.userModel
      .find($filter, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
      .sort($orderBy)

  }



  async createGoogleUser(userObject) {
    const {

      first_name,
      last_name,
      email,
      uuid,
      country_code,
      phone_no,
    } = userObject;

    const ifEmailExists = await this.getUserByEmail(email);
    if (ifEmailExists) {
      throw new ConflictException('Email already exists')
    }
    // const ifPhoneExists = await this.getUserByPhoneNumber(phone_no);
    // if (ifPhoneExists) {
    //   throw new ConflictException('Phone number already exists')
    // }

    const ifUuidExists = await this.userModel.findOne({ uuid: uuid });
    if (ifUuidExists) {
      throw new ConflictException('UUID already exists')
    }

    let createdUser;

    createdUser = await new this.userModel({
      first_name,
      last_name,
      email,
      uuid,
      country_code,
      phone_no,
    }).save();


    return createdUser

  }



  /**
   * The purpose of this method is to create user inside mongodb
   * @param datasetObject receives user object of interface type IUsers as an argument
   * @returns the created user object
   */
  async insertUser(userObject: CreateUserDto) {
    const {
      image,
      first_name,
      last_name,
      email,
      dob,
      uuid,
      country_code,
      phone_no,
    } = userObject;

    const ifEmailExists = await this.getUserByEmail(email);
    if (ifEmailExists) {
      throw new ConflictException('Email already exists')
    }
    const ifPhoneExists = await this.getUserByPhoneNumber(phone_no);
    if (ifPhoneExists) {
      throw new ConflictException('Phone number already exists')
    }

    const ifUuidExists = await this.userModel.findOne({ uuid: uuid });
    if (ifUuidExists) {
      throw new ConflictException('UUID already exists')
    }

    let createdUser;

    createdUser = await new this.userModel({
      image,
      first_name,
      last_name,
      email,
      dob,
      uuid,
      country_code,
      phone_no,
    }).save();


    return createdUser

  }

  async joinUser(userObject: CreateHostUserDto) {
    const {
      image,
      first_name,
      last_name,
      email,
      country_code,
      for_car,
      for_stay,
      phone_no,
      address
    } = userObject;


    let createdUser;

    createdUser = await new this.userModel({
      image,
      first_name,
      last_name,
      email,
      for_car,
      for_stay,
      country_code,
      is_host: true,
      phone_no,
      address
    }).save();


    return createdUser

  }


  async insertGoogleUser(userObject: CreateUserDto) {
    const {
      image,
      first_name,
      last_name,
      email,
      dob,
      uuid,
      country_code,
      phone_no,
    } = userObject;

    const ifEmailExists = await this.getUserByEmail(email);
    if (ifEmailExists) {
      throw new ConflictException('Email already exists')
    }
    const ifPhoneExists = await this.getUserByPhoneNumber(phone_no);
    if (ifPhoneExists) {
      throw new ConflictException('Phone number already exists')
    }

    const ifUuidExists = await this.userModel.findOne({ uuid: uuid });
    if (ifUuidExists) {
      throw new ConflictException('UUID already exists')
    }

    let createdUser;

    createdUser = await new this.userModel({
      image,
      first_name,
      last_name,
      email,
      dob,
      uuid,
      country_code,
      phone_no,
    }).save();


    return createdUser

  }


  async updateUserMobile(userObject: UpdateUserDto, user: { userId?: ObjectId }) {

    const userExists = await this.userModel.findOne({ _id: user.userId })

    if (!userExists) {
      throw new BadRequestException('Invalid token')
    }


    const {
      image,
      first_name,
      last_name,
      email,
      phone_no,
      is_disabled,
      fcm_token,
      is_deleted,
      country_code,
      gender,
      biography,
      emergency_contact,
      country,
      street,
      suite,
      city,
      post_code,
      dob

    } = userObject;


    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: userExists._id },
      {
        image,
        first_name,
        last_name,
        email,
        phone_no,
        fcm_token,
        is_deleted,
        country_code,
        gender,
        biography,
        is_disabled,
        emergency_contact,
        country,
        street,
        suite,
        city,
        post_code,
        dob
      },
      { new: true }
    );

    return { status: true, statusCode: 204, message: `User ${is_deleted ? 'deleted' : is_deleted ? 'deleted' : 'updated'} successfully`, data: updatedUser };
  }


  /**
   * The purpose of this method is to update user data
   * @param userId receives userId of the user that we want to update
   * @param userObject receives the user object that contains data that we want to update as an argument
   * @returns the updated user object
   */
  async updateUser(id, userObject: UpdateUserDto, user: { userId?: ObjectId }) {

    const userExists = await this.userModel.findOne({ _id: id })

    if (!userExists) {
      throw new BadRequestException('Invalid token')
    }

    const {
      image,
      first_name,
      last_name,
      email,
      phone_no,
      is_disabled,
      fcm_token,
      is_deleted,
      country_code,
      gender,
      biography,
      emergency_contact,
      country,
      street,
      suite,
      city,
      post_code,
      dob

    } = userObject;


    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: userExists._id },
      {
        image,
        first_name,
        last_name,
        email,
        phone_no,
        fcm_token,
        is_deleted,
        country_code,
        gender,
        biography,
        is_disabled,
        emergency_contact,
        country,
        street,
        suite,
        city,
        post_code,
        dob
      },
      { new: true }
    );

    return { status: true, statusCode: 204, message: `User ${is_deleted ? 'deleted' : is_deleted ? 'deleted' : 'updated'} successfully`, data: updatedUser };
  }

  async updateHostUser(id, userObject: UpdateHostDto, user: { userId?: ObjectId }) {

    const userExists = await this.userModel.findOne({ _id: id })

    if (!userExists) {
      throw new BadRequestException('Invalid token')
    }

    const {
      status

    } = userObject;


    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: userExists._id },
      {
        host_status: status,
        updated_by: user.userId
      },
      { new: true }
    );

    return updatedUser
  }



}
