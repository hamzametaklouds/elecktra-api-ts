import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { IUsers } from './users.schema';
import { USERS_PROVIDER_TOKEN } from './users.constants';
import { CreateUserDto } from './dtos/create-users.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { ConfigService } from '@nestjs/config';
import { SignUpUserDto } from 'src/auth/dtos/sign-up.dto';
import { InvitationsService } from 'src/invitations/invitations.service';
import { Role } from 'src/roles/roles.schema';
import { CompanyService } from 'src/company/company.service';
const bcrypt = require('bcryptjs');

const { RESOURCE_NOT_FOUND } = getMessages('users(s)');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_PROVIDER_TOKEN)
    private userModel: Model<IUsers>,
    private configService: ConfigService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationService: InvitationsService,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
  ) { }

  async getUserByEmail(email: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ email: email, is_deleted: false });
  }

  async markEmailAsVerified(userId: ObjectId) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { email_verified: true },
      { new: true }
    );
  }

  async updateUserPassword(id, password) {

    const hashPassword = await bcrypt.hash(password, 10);

    return await this.userModel.findByIdAndUpdate({ _id: id }, { password: hashPassword })
  }


  async getUserByUUID(uuid: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ uuid: uuid, is_deleted: false });
  }

  async getUserByPhoneNumber(phone_no: string): Promise<IUsers> {
    return await this.userModel
      .findOne({ phone_no: phone_no, is_deleted: false })
  }

  async getUserById(id): Promise<IUsers> {
    return await this.userModel
      .findOne({ _id: id, is_deleted: false })
  }

  async getUserData(user: { userId?: ObjectId }): Promise<IUsers> {
    return await this.userModel
      .findOne({ _id: user.userId, is_deleted: false })
  }


  async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy,user: { userId?: ObjectId, company_id?: ObjectId}) {
    
    if(user?.company_id){
      filter['company_id'] = user?.company_id
    }

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
  async getFilteredUsers($filter: Object, $orderBy,user: { userId?: ObjectId, company_id?: ObjectId}) {
    if(user?.company_id){
      $filter['company_id'] = user?.company_id
    }
    return await this.userModel
      .find($filter, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
      .sort($orderBy)

  }



  async createGoogleUser(userObject: {
    first_name?: string,
    last_name?: string,
    email?: string,
    uuid?: string,
   image?:string
  }) {
    const {
      first_name,
      last_name,
      email,
      uuid,
      image
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
     image:image?image:'',
     email_verified:true,
     email_verified_at:new Date()
    }).save();


    return createdUser

  }



  /**
   * The purpose of this method is to create user inside mongodb
   * @param datasetObject receives user object of interface type IUsers as an argument
   * @returns the created user object
   */
  async insertUser(userObject: SignUpUserDto) {
    const {
      image,
      first_name,
      last_name,
      email,
      business_name,
      invitation_id,
      password,
    } = userObject;

    const ifEmailExists = await this.getUserByEmail(email);
    if (ifEmailExists) {
      throw new ConflictException('Email already exists')
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let invitation;
    if(invitation_id){
       invitation = await this.invitationService.getinvitationById(invitation_id);
      if(!invitation || invitation?.email !== email){
        throw new BadRequestException('Invalid invitation id')
      }
      await this.invitationService.updateInvitationUser(invitation._id);

     const createdUser = await new this.userModel({
        image,
        first_name,
        last_name,
        email,
        invitation_id: invitation?invitation?._id:null,
        roles: invitation?.role?[invitation?.role]:[Role.BUSINESS_OWNER],
        password: hashPassword,
        business_name: null,
        company_id:invitation?.company_id, // Add the company ID to the user
        created_by: invitation?.created_by?invitation?.created_by:null
      }).save();

      return createdUser;
    }

    // Create company first
    const companyName = business_name || first_name;

    const company = await this.companyService.create({
      name: companyName,
      website: '',
      bio: '',
      image: '',
    }, { userId: null }); // Pass null as userId since user isn't created yet

    let createdUser;

    createdUser = await new this.userModel({
      image,
      first_name,
      last_name,
      email,
      invitation_id: invitation?invitation?._id:null,
      roles: invitation?.role?[invitation?.role]:[Role.BUSINESS_OWNER],
      password: hashPassword,
      business_name: business_name?business_name:first_name,
      company_id: company._id, // Add the company ID to the user
      created_by: invitation?.created_by?invitation?.created_by:null
    }).save();

    // Update the company with the created user as created_by
    await this.companyService.update(company._id.toString(), {
      created_by: createdUser._id
    });

    return createdUser;
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

  async updateUserAppleId(userId, appleId) {
    return await this.userModel.findByIdAndUpdate({ _id: userId }, { apple_id: appleId })
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

  async updatePassword(email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await this.userModel.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
    );
    
    if (!user) {
        throw new NotFoundException('User not found');
    }
    
    return user;
  }

}
