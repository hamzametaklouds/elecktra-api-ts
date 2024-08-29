import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { ISystemUsers } from './system-users.schema';
import { SYSTEM_USERS_PROVIDER_TOKEN } from './system-users.constant';
import { ConfigService } from '@nestjs/config';
const bcrypt = require('bcryptjs');

const {  RESOURCE_NOT_FOUND } = getMessages('users(s)');

@Injectable()
export class SystemUsersService {
    constructor(
        @Inject(SYSTEM_USERS_PROVIDER_TOKEN)
        private userModel: Model<ISystemUsers>,
        private configService: ConfigService
      ) {}
    
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
          .findOne({ _id: id ,is_deleted:false})
          
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

      
}
