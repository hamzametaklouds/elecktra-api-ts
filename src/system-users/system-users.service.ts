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
    // Find the user with the provided userId and check if they are not deleted
    const userExist = await this.userModel.findOne({
      _id: user.userId,
      is_deleted: false,
    });

    if (!userExist) {
      throw new Error('User does not exist');
    }

    // Fetch all users created by the `userExist`, excluding specific fields
    const users = await this.userModel.find(
      { roles: ['internal_admin'] },
      { created_at: 0, updated_at: 0, password: 0, __v: 0, created_by: 0, updated_by: 0 }
    );

    // Remove the user matching `user.userId` from the result
    const filteredUsers = users.filter((u) => u._id.toString() !== user.userId?.toString());

    return filteredUsers;
  }

  async getUserDataSuper(user: { userId?: ObjectId }) {
    // Find the user with the provided userId and check if they are not deleted
    const userExist = await this.userModel.findOne({
      _id: user.userId,
      is_deleted: false,
    });

    if (!userExist) {
      throw new Error('User does not exist');
    }

    // Fetch all users created by the `userExist`, excluding specific fields
    const users = await this.userModel.find(
      { roles: ['super_admin'] },
      { created_at: 0, updated_at: 0, password: 0, __v: 0, created_by: 0, updated_by: 0 }
    );

    // Remove the user matching `user.userId` from the result
    const filteredUsers = users.filter((u) => u._id.toString() !== user.userId?.toString());

    return filteredUsers;
  }


  async getUserByPhoneNumber(phone_no: string): Promise<ISystemUsers> {
    return await this.userModel
      .findOne({ phone_no: phone_no, is_deleted: false })
  }

  async getCompanyAdminsPaginated($rpp, $page, $filter, $orderBy, user) {


    if ($filter['company_id']) {
      $filter = { companies: $filter['company_id'] }
    }
    else {
      $filter = { is_deleted: false }

    }

    $filter['roles'] = ['company_admin']

    const skip: number = ($page - 1) * $rpp;
    const totalDocuments: number = await this.userModel.countDocuments($filter);
    const totalPages: number = Math.ceil(totalDocuments / $rpp);
    $page = $page > totalPages ? totalPages : $page;

    const users = await this.userModel
      .find($filter, {
        _id: 1,
        first_name: 1,
        last_name: 1,
        email: 1,
        country_code: 1,
        phone_no: 1,
        companies: 1, is_disabled: 1, is_deleted: 1
      })
      .sort($orderBy)
      .skip(skip)
      .limit($rpp)
      .populate({ path: 'companies', select: '_id title description icon' })
      .populate({ path: 'created_by', select: '_id first_name last_name' })
    return { pages: `Page ${$page} of ${totalPages}`, current_page: $page, total_pages: totalPages, total_records: totalDocuments, data: users };

  }

  async getCompanyAdminsFiltered($filter, $orderBy, user) {


    if ($filter['company_id']) {
      $filter = { companies: $filter['company_id'] }
    }
    else {
      $filter = { is_deleted: false }
    }

    $filter['roles'] = ['company_admin']

    const users = await this.userModel
      .find($filter, {
        _id: 1,
        first_name: 1,
        last_name: 1,
        email: 1,
        country_code: 1,
        phone_no: 1,
        companies: 1, is_disabled: 1, is_deleted: 1
      })
      .sort($orderBy)
      .populate({ path: 'companies', select: '_id title description icon' })
      .populate({ path: 'created_by', select: '_id first_name last_name' })


    return { data: users };

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
  async getSystemUserByEmail(company_id: ObjectId) {
    try {
      const users = await this.userModel.find({
        $or: [
          { companies: company_id },
        ],
        is_deleted: false,
        is_disabled: false,
      }, { email: 1, _id: 0 }); // Fetching only the email field

      return users.map(user => user.email);
    } catch (error) {
      console.error('Error fetching system users:', error);
      throw new Error('Failed to fetch system users');
    }
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

    console.log(await bcrypt.hash(password, 10));
    const ifEmailExists = await this.getUserByEmail(email.toLowerCase());
    if (ifEmailExists) {
      throw new ConflictException('Email already exists')

    }
    // const ifPhoneExists = await this.getUserByPhoneNumber(phone_no);
    // if (ifPhoneExists) {
    //   throw new ConflictException('Phone number already exists')
    // }

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

    await this.invitationsService.updateInvitationUser(invitation_id);



    createdUser = await new this.userModel({
      image,
      first_name,
      last_name,
      email: email?.toLowerCase(),
      phone_no,
      password: hashPassword,
      is_disabled: false,
      companies: invitation?.company_id ? [invitation?.company_id] : null,
      roles: [invitation?.role],
      created_by: invitation ? invitation?.created_by : null

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

  async updateUserPassword(id, password) {

    const hashPassword = await bcrypt.hash(password, 10);

    return await this.userModel.findByIdAndUpdate({ _id: id }, { password: hashPassword })
  }

  async updateUser(id, userObject: DeleteSystemUserDto, user: { userId?: ObjectId }) {
    const {
      email,
      phone_no,
      first_name,
      last_name,
      is_deleted,
      is_disabled
    } = userObject;

    const systemUserExists = await this.userModel.findOne({ _id: id, is_deleted: false })

    if (!systemUserExists) {
      throw new BadRequestException('Invalid User Id')
    }

    // if (systemUserExists?.created_by?.toString() !== user?.userId?.toString()) {
    //   throw new UnauthorizedException('Operation not authorized')
    // }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: systemUserExists._id },
      {
        email,
        phone_no,
        first_name,
        last_name,
        is_deleted,
        is_disabled
      },
      { new: true })


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
