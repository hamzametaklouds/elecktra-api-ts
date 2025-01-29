import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import mongoose, { Model, ObjectId } from 'mongoose';
import { ILandingPageConfigs } from './landing-page-configs.schema';
import { APP_CONFIGS_PROVIDER_TOKEN, LANDING_PAGE_CONFIGS_PROVIDER_TOKEN } from './landing-page-configs.constants';
import { CreateLandingPageConfigDto } from './dtos/create-destination.dto';
import { IAppConfigs } from './app-configuration';
import { CreateOrUpdateAppConfigDto } from './dtos/create-app-config.dto';

@Injectable()
export class LandingPageConfigsService {
    constructor(
        @Inject(LANDING_PAGE_CONFIGS_PROVIDER_TOKEN)
        private landingPageConfigModel: Model<ILandingPageConfigs>,
        @Inject(APP_CONFIGS_PROVIDER_TOKEN)
        private appConfigsModel: Model<IAppConfigs>
    ) { }


    async landingConfigs() {

        return await this.landingPageConfigModel
            .findOne({ is_deleted: false, is_disabled: false }, { created_at: 0, updated_at: 0, __v: 0, created_by: 0, updated_by: 0 })
            .sort({ created_at: -1 })
    }
// Service Methods
async createOrUpdateConfig(body: CreateOrUpdateAppConfigDto, user: { userId?: string }) {
  const { welcome_slides } = body;

  // Check if a configuration already exists
  const existingConfig = await this.appConfigsModel.findOne();

  if (existingConfig) {
  await this.appConfigsModel.findByIdAndUpdate({ _id: existingConfig._id }, { $set: { welcome_slides } });
  }

  // Create a new configuration
  const newConfig = new this.appConfigsModel({
      welcome_slides,
      created_by: user.userId,
  });

  return await newConfig.save();
}

    
      /**
       * Fetch the app configuration
       */
      async getAppConfig() {
        return await this.appConfigsModel
          .findOne({ is_deleted: false })
          .select('-__v -created_by -updated_by');
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
