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
            .find({ parent_type: OptionParentType.S, sub_type: OptionSubType.E }, { title: 1, description: 1, sub_type: 1, icon: 1 })

        const features = await this.optionsModel
            .find({ parent_type: OptionParentType.S, sub_type: OptionSubType.F }, { title: 1, description: 1, sub_type: 1, icon: 1 })

        return {
            essentials: essentials,
            features: features
        }
    }

    async getOptionsForCars() {
        const fuel_types = await this.optionsModel
            .find({ parent_type: OptionParentType.C, sub_type: OptionSubType.FT }, { _id: 1, title: 1, description: 1, sub_type: 1, icon: 1 })

        const car_makes = await this.optionsModel
            .find({ parent_type: OptionParentType.C, sub_type: OptionSubType.M }, { _id: 1, title: 1, description: 1, sub_type: 1, icon: 1 })

        const transmission = await this.optionsModel
            .find({ parent_type: OptionParentType.C, sub_type: OptionSubType.T }, { _id: 1, title: 1, description: 1, sub_type: 1, icon: 1 })

        return {
            fuel_types: fuel_types,
            car_makes: car_makes,
            transmission: transmission
        }
    }




    async insertOption(body: CreateOptionDto, user: { userId?: ObjectId }) {

        const { title, description, parent_type, icon, sub_type } = body;

        const screen = await new this.optionsModel(
            {
                title,
                description,
                icon,
                parent_type,
                sub_type,
                created_by: user?.userId || null
            }).save();


        return screen

    }

}
