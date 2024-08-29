import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateScreenConfigDto } from './dtos/create-screen-configs.dto';
import { SCREEN_CONFIGS_PROVIDER_TOKEN } from './screen-configs.constants';
import { IScreenConfigs } from './screen-configs.schema';

@Injectable()
export class ScreenConfigsService {
    constructor(
        @Inject(SCREEN_CONFIGS_PROVIDER_TOKEN)
        private screenModel: Model<IScreenConfigs>
    ) { }

    async getScreens(screen) {
        return await this.screenModel
            .find({ type: screen })
            .sort({ order_number: 1 })
    }


    async insertScreen(body: CreateScreenConfigDto, user: { userId?: ObjectId }) {

        const { title, description, type, order_number, images } = body;

        const screen = await new this.screenModel(
            {
                title,
                description,
                type,
                order_number,
                images,
                created_by: user.userId
            }).save();


        return screen

    }

}
