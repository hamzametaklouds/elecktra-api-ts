import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { ISystemUsers } from './system-users.schema';
import { SYSTEM_USERS_PROVIDER_TOKEN } from './system-users.constant';
import { ConfigService } from '@nestjs/config';
import { CreateSystemUserDto } from './dtos/create-system-users.dto';
import { Role } from 'src/roles/roles.schema';
const bcrypt = require('bcryptjs');

const { RESOURCE_NOT_FOUND } = getMessages('users(s)');

@Injectable()
export class SystemUsersService {
  constructor(
    @Inject(SYSTEM_USERS_PROVIDER_TOKEN)
    private userModel: Model<ISystemUsers>,
    private configService: ConfigService
  ) { }

  async getUserByEmail(email: string): Promise<ISystemUsers> {
    return await this.userModel
      .findOne({ email: email, is_deleted: false }).populate({
        path: 'created_by updated_by',
        match: { is_deleted: false },
      })

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

      //return {status:false,statusCode:409,message:'Email already exists',data:null}       
    }
    const ifPhoneExists = await this.getUserByPhoneNumber(phone_no);
    if (ifPhoneExists) {
      throw new ConflictException('Phone number already exists')
      //return {status:false,statusCode:409,message:'Phone number already exists',data:null}  
    }


    let invitation;

    //If Invitation id is received in parameters the logic below will be followed for checks of invitation validity
    if (invitation_id) {
      //  invitation = await this.invitationsService.getInvitationById(invitation_id);

      if (!invitation) {
        throw new NotFoundException('Invalid invitation id')
        //return {status:false,statusCode:404,message:'Invalid invitation id',data:null}
      }
      else {
        var diff = (invitation.created_at.getTime() - new Date().getTime()) / 1000;
        diff /= 60;
        const difference = Math.abs(Math.round(diff));
        const daysInSeconds = 86400 * parseInt(this.configService.get('platformInvitationExpiryInDays.platformInvitationExpiryInDays'))

        if (difference > daysInSeconds) {
          throw new BadRequestException('The invitation has been expired, try requesting invitation again!')
          //return { status:false,statusCode:400,message:'The invitation has been expired, try requesting invitation again!',data:null};
        }
      }
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let createdUser;

    if (invitation_id) {
      createdUser = await this.userModel.findByIdAndUpdate(
        invitation.user,
        {
          image,
          first_name,
          last_name,
          email: email?.toLocaleLowerCase(),
          phone_no,
          password: hashPassword,

        },
        { new: true }
      );
      //   this.invitationsService.updateInvitationUser(invitation_id, createdUser._id);
    }
    else {
      //let allBandPermissions=await this.modulesService.getmoduleAndPermissions(ModuleType.B,false)

      createdUser = await new this.userModel({
        image,
        first_name,
        last_name,
        email,
        phone_no,
        password: hashPassword,
        roles: [Role.COMPANY_ADMIN],

      }).save();
    }

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


}
