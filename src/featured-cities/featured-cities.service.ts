import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IFeaturedCities } from './featured-cities.schema';
import { FEATURED_CITIES_PROVIDER_TOKEN } from './featured-cities.constants';
import { CreateFeaturedCityDto } from './dtos/create-featured-city.dto';
import { UpdateFeaturedCityDto } from './dtos/update-featured-city.dto';

@Injectable()
export class FeaturedCitiesService {
    constructor(
        @Inject(FEATURED_CITIES_PROVIDER_TOKEN)
        private featuredCityModel: Model<IFeaturedCities>
    ) { }

    async create(body: CreateFeaturedCityDto, user: { userId?: ObjectId }) {
        const { title, description, address, lat, long, images } = body;

        const city = await new this.featuredCityModel({
            title,
            description,
            address,
            location: {
                type: 'Point',
                coordinates: [long, lat]
            },
            images,
            created_by: user.userId || null
        }).save();

        return city;
    }

    async update(id: string, body: UpdateFeaturedCityDto, user: { userId?: ObjectId }) {
        const { title, description, address, lat, long, images, is_disabled, is_deleted } = body;

        const cityExists = await this.featuredCityModel.findOne({ _id: id, is_deleted: false });

        if (!cityExists) {
            throw new BadRequestException('Invalid Id');
        }

        const city = await this.featuredCityModel.findByIdAndUpdate(
            { _id: cityExists._id },
            {
                title,
                description,
                address,
                location: {
                    type: 'Point',
                    coordinates: [long, lat]
                },
                images,
                is_deleted,is_disabled,
                updated_by: user.userId || null
            },
            { new: true }
        );

        return city;
    }

    async findAll() {
        return await this.featuredCityModel
            .find(
                { is_deleted: false },
                { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 }
            )
            .sort({ created_at: -1 });
    }

    async findOne(id: string) {
        const city = await this.featuredCityModel.findOne(
            { _id: id, is_deleted: false },
            { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 }
        );

        if (!city) {
            throw new BadRequestException('City not found');
        }

        return city;
    }
} 