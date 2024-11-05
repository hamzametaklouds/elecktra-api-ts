import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { ISystemUsers } from './system-users.schema';
import { SYSTEM_USERS_PROVIDER_TOKEN } from './system-users.constant';
import { ConfigService } from '@nestjs/config';
import { CreateSystemUserDto } from './dtos/create-system-users.dto';
import { Role } from 'src/roles/roles.schema';
import { InvitationsService } from 'src/invitations/invitations.service';
import { DeleteSystemUserDto } from './dtos/delete-system-users.dto';
const bcrypt = require('bcryptjs');

const { RESOURCE_NOT_FOUND } = getMessages('users(s)');

@Injectable()
export class SystemUsersService {
  constructor(
    @Inject(SYSTEM_USERS_PROVIDER_TOKEN)
    private userModel: Model<ISystemUsers>,
    private configService: ConfigService,
    private invitationsService: InvitationsService
  ) { }

  async getUserByEmail(email: string): Promise<ISystemUsers> {
    return await this.userModel
      .findOne({ email: email, is_deleted: false, is_disabled: false })

  }

  async getUserData(user: { userId?: ObjectId }) {
    const userExist = await this.userModel
      .findOne({ _id: user.userId, is_deleted: false })


    return await this.userModel
      .find({ created_by: userExist._id, roles: ['internal_admin'] }, { created_at: 0, updated_at: 0, password: 0, __v: 0, created_by: 0, updated_by: 0 })

  }

  async getUserDataSuper(user: { userId?: ObjectId }) {
    const userExist = await this.userModel
      .findOne({ _id: user.userId, is_deleted: false })


    return await this.userModel
      .find({ created_by: userExist._id, roles: ['super_admin'] }, { created_at: 0, updated_at: 0, password: 0, __v: 0, created_by: 0, updated_by: 0 })

  }

  async getUserByPhoneNumber(phone_no: string): Promise<ISystemUsers> {
    return await this.userModel
      .findOne({ phone_no: phone_no, is_deleted: false })
  }

  async getUserById(id: ObjectId): Promise<ISystemUsers> {
    return await this.userModel
      .findOne({ _id: id, is_deleted: false })

  }

  /**
   * The purpose of this method is to return paginated users based on received arguments
   * @param rpp recieves record per page as an argument
   * @param page receives page number as an argument
   * @param filter receives filter object as an argument
   * @param orderBy receives order by as an argument
   * @returns Page out of total pages, total number of documents received and filtered paginated user data
   */
  async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy): Promise<IPageinatedDataTable> {
    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.userModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const users = await this.userModel
      .find(filter)
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)


    return { pages: `Page ${page} of ${totalPages}`, total: totalDocuments, data: users };
  }

  /**
   *The purpose of this method is to return users based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns users based on filter
   */
  async getFilteredUsers($filter: Object, $orderBy) {
    return await this.userModel
      .find($filter)
      .sort($orderBy)

  }

  async insertUser(userObject: CreateSystemUserDto) {
    const {
      image,
      first_name,
      last_name,
      email,
      phone_no,
      password,
      invitation_id,
    } = userObject;

    const ifEmailExists = await this.getUserByEmail(email);
    if (ifEmailExists) {
      throw new ConflictException('Email already exists')

    }
    const ifPhoneExists = await this.getUserByPhoneNumber(phone_no);
    if (ifPhoneExists) {
      throw new ConflictException('Phone number already exists')
    }


    let invitation;


    invitation = await this.invitationsService.getInvitationById(invitation_id);

    if (!invitation) {
      throw new NotFoundException('Invalid invitation id')
    }
    else {
      var diff = (invitation.created_at.getTime() - new Date().getTime()) / 1000;
      diff /= 60;
      const difference = Math.abs(Math.round(diff));
      const daysInSeconds = 86400 * parseInt(this.configService.get('platformInvitationExpiryInDays.platformInvitationExpiryInDays'))

      if (difference > daysInSeconds) {
        throw new BadRequestException('The invitation has been expired, try requesting invitation again!')
      }
    }


    const hashPassword = await bcrypt.hash(password, 10);

    let createdUser;



    createdUser = await new this.userModel({
      image,
      first_name,
      last_name,
      email: email?.toLocaleLowerCase(),
      phone_no,
      password: hashPassword,
      roles: [Role.COMPANY_ADMIN],

    }).save();


    return {
      status: true, statusCode: 201, message: 'System User created successfully', data: {
        _id: createdUser._id,
        first_name: createdUser.first_name,
        last_name: createdUser.last_name,
        email: createdUser.email,
        phone_no: createdUser.phone_no,
        email_verified: createdUser.email_verified,
        phone_verified: createdUser.phone_verified,
      }
    }

  }

  async updateUser(id, userObject: DeleteSystemUserDto, user: { userId?: ObjectId }) {
    const {
      is_deleted,
      is_disabled
    } = userObject;

    const systemUserExists = await this.userModel.findOne({ _id: id, is_deleted: false })

    if (!systemUserExists) {
      throw new BadRequestException('Invalid User Id')
    }

    if (systemUserExists?.created_by?.toString() !== user?.userId?.toString()) {
      throw new UnauthorizedException('Operation not authorized')
    }

    const updatedUser = await this.userModel.findByIdAndUpdate({ _id: systemUserExists._id }, { is_deleted: is_deleted, is_disabled: is_disabled }, { new: true })


    return {
      status: true, statusCode: 201, message: 'System User updated successfully', data: {
        _id: updatedUser._id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        phone_no: updatedUser.phone_no,
        is_deleted: updatedUser.is_deleted,
        is_disabled: updatedUser.is_disabled
      }
    }

  }


}
