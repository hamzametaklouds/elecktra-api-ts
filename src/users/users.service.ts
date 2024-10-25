import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { IUsers } from './users.schema';
import { USERS_PROVIDER_TOKEN } from './users.constants';
import { CreateUserDto } from './dtos/create-users.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
const bcrypt = require('bcryptjs');

const { RESOURCE_NOT_FOUND } = getMessages('users(s)');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_PROVIDER_TOKEN)
    private userModel: Model<IUsers>,
    private configService: ConfigService,
  ) { }

  async getUserByEmail(email: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ email: email, is_deleted: false });
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


  async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy): Promise<IPageinatedDataTable> {
    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.userModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const bandCategorySection = await this.userModel
      .find(filter, { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)

    return { pages: `Page ${page} of ${totalPages}`, total: totalDocuments, data: bandCategorySection };
  }

  /**
   *The purpose of this method is to return bandCategory based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns bandCategory based on filter
   */
  async getFilteredUsers($filter: Object, $orderBy) {
    return await this.userModel
      .find($filter, { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 })
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

  /**
   * The purpose of this method is to update user data
   * @param userId receives userId of the user that we want to update
   * @param userObject receives the user object that contains data that we want to update as an argument
   * @returns the updated user object
   */
  async updateUser(userObject: UpdateUserDto, user: { userId?: ObjectId }) {

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
      userExists._id,
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

}
