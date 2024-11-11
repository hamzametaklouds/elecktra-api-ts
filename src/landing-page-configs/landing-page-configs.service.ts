import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { ILandingPageConfigs } from './landing-page-configs.schema';
import { LANDING_PAGE_CONFIGS_PROVIDER_TOKEN } from './landing-page-configs.constants';
import { CreateLandingPageConfigDto } from './dtos/create-destination.dto';

@Injectable()
export class LandingPageConfigsService {
    constructor(
        @Inject(LANDING_PAGE_CONFIGS_PROVIDER_TOKEN)
        private landingPageConfigModel: Model<ILandingPageConfigs>
    ) { }


    async landingConfigs() {

        return await this.landingPageConfigModel
            .findOne({ is_deleted: false, is_disabled: false }, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
            .sort({ created_at: -1 })
    }


    async insertScreen(body: CreateLandingPageConfigDto, user: { userId?: ObjectId }) {

        const { hosts, cities, app_downloads } = body;

        await this.landingPageConfigModel.updateMany({ is_deleted: false }, { is_deleted: true }, { new: true })

        const screen = await new this.landingPageConfigModel(
            {
                hosts,
                cities,
                app_downloads,
                created_by: user.userId ? user.userId : null
            }).save();


        return screen

    }

    // async updateScreen(id, body: UpdateDestinationDto, user: { userId?: ObjectId }) {

    //     const { title, description, lat, long, images, is_popular, is_deleted } = body;

    //     const screenExist = await this.destinationModel.findOne({ _id: id, is_deleted: false })

    //     if (!screenExist) {
    //         throw new BadRequestException('Invalid Id')
    //     }

    //     const screen = await this.destinationModel.findByIdAndUpdate(
    //         { _id: screenExist._id },
    //         {
    //             title,
    //             description,
    //             location: {
    //                 type: 'Point',
    //                 coordinates: [long, lat]
    //             },
    //             is_popular,
    //             images,
    //             is_deleted,
    //             created_by: user.userId ? user.userId : null
    //         }, { new: true })


    //     return screen

    // }


}
