import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { OPTIONS_PROVIDER_TOKEN } from './options.constants';
import { IOptions, OptionParentType, OptionSubType } from './options.schema';
import { CreateOptionDto } from './dtos/create-options.dto';

@Injectable()
export class OptionsService {
    constructor(
        @Inject(OPTIONS_PROVIDER_TOKEN)
        private optionsModel: Model<IOptions>
    ) { }

    async getOptionsForAmenities() {
        const essentials = await this.optionsModel
            .find({ parent_type: OptionParentType.S, sub_type: OptionSubType.E }, { title: 1, description: 1, sub_type: 1 })

        const features = await this.optionsModel
            .find({ parent_type: OptionParentType.S, sub_type: OptionSubType.F }, { title: 1, description: 1, sub_type: 1 })

        return {
            essentials: essentials,
            features: features
        }
    }




    async insertOption(body: CreateOptionDto, user: { userId?: ObjectId }) {

        const { title, description, parent_type, sub_type } = body;

        const screen = await new this.optionsModel(
            {
                title,
                description,
                parent_type,
                sub_type,
                created_by: user?.userId || null
            }).save();


        return screen

    }

}
