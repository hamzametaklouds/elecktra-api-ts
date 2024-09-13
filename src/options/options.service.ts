import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { OPTIONS_PROVIDER_TOKEN } from './options.constants';
import { IOptions } from './options.schema';
import { CreateOptionDto } from './dtos/create-options.dto';

@Injectable()
export class OptionsService {
    constructor(
        @Inject(OPTIONS_PROVIDER_TOKEN)
        private optionsModel: Model<IOptions>
    ) { }

    // async getScreens(screen) {
    //     return await this.optionsModel
    //         .find({ type: screen })
    //         .sort({ order_number: 1 })
    // }


    async insertOption(body: CreateOptionDto, user: { userId?: ObjectId }) {

        const { title, description, parent_type, sub_type } = body;

        const screen = await new this.optionsModel(
            {
                title,
                description,
                parent_type,
                sub_type,
                created_by: user.userId
            }).save();


        return screen

    }

}
