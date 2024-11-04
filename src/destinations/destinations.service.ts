import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IDestinations } from './destinations.schema';
import { DESTINATIONS_PROVIDER_TOKEN } from './destinations.constants';
import { CreateDestinationDto } from './dtos/create-destination.dto';
import { UpdateDestinationDto } from './dtos/update-destination.dto';

@Injectable()
export class DestinationsService {
    constructor(
        @Inject(DESTINATIONS_PROVIDER_TOKEN)
        private destinationModel: Model<IDestinations>
    ) { }


    async insertScreen(body: CreateDestinationDto, user: { userId?: ObjectId }) {

        const { title, description, lat, long, images, is_popular } = body;

        const screen = await new this.destinationModel(
            {
                title,
                description,
                location: {
                    type: 'Point',
                    coordinates: [long, lat]
                },
                is_popular,
                images,
                created_by: user.userId ? user.userId : null
            }).save();


        return screen

    }

    async updateScreen(id, body: UpdateDestinationDto, user: { userId?: ObjectId }) {

        const { title, description, lat, long, images, is_popular } = body;

        const screenExist = await this.destinationModel.findOne({ _id: id, is_deleted: false })

        if (!screenExist) {
            throw new BadRequestException('Invalid Id')
        }

        const screen = await this.destinationModel.findByIdAndUpdate(
            { _id: screenExist._id },
            {
                title,
                description,
                location: {
                    type: 'Point',
                    coordinates: [long, lat]
                },
                is_popular,
                images,
                created_by: user.userId ? user.userId : null
            }, { new: true })


        return screen

    }

    async destinations() {


        const destination = await this.destinationModel.find({ is_deleted: false })

        return destination

    }

}
