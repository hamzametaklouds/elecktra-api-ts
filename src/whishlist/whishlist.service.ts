import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateWhishlistDto } from './dtos/create-whishlist.dto';
import { HotelAndCarsService } from 'src/hotel-and-cars/hotel-and-cars.service';
import { RecordType } from 'src/hotel-and-cars/hotel-and-cars.schema';
import { IWhishlist } from './whishlist.schema';
import { WHISHLIST_PROVIDER_TOKEN } from './whishlist.constants';

@Injectable()
export class WhishlistService {
    constructor(
        @Inject(WHISHLIST_PROVIDER_TOKEN)
        private whishlistModel: Model<IWhishlist>,
        private hotelAndCarsService: HotelAndCarsService
    ) { }


    async getWishlist(user: { userId?: ObjectId }) {
        const userExists = await this.whishlistModel.findOne({ user_id: user.userId, is_deleted: false })

        if (!userExists) {
            throw new BadRequestException('Wishlist does not exist')
        }

        console.log()
        const hotels = await this.whishlistModel.aggregate([
            {
                $match: { user_id: userExists.user_id }
            },
            {
                $lookup: {
                    from: 'hotel_and_cars',
                    localField: 'hotels',
                    foreignField: '_id',
                    as: 'hotels',
                },
            },
            {
                $project: {
                    _id: 1,
                    hotels: {
                        $map: {
                            input: '$hotels',
                            as: 'hotel',
                            in: {
                                _id: '$$hotel._id',
                                title: '$$hotel.title',
                                description: '$$hotel.description',
                                address: '$$hotel.address',
                                images: '$$hotel.images',
                                highlights: '$$hotel.highlights',
                                price: '$$hotel.price',
                                ratings: { $literal: 3.2 },
                                total_reviews: { $literal: 321 },
                                location: '$$hotel.location',
                                hotel_type: '$$hotel.hotel_type',
                                is_in_wishlist: { $literal: false }
                            }
                        }
                    }
                }
            }
        ])

        return hotels[0]?.hotels && hotels[0]?.hotels?.length !== 0 ? hotels[0]?.hotels : []

    }

    async insertWhishlist(body: CreateWhishlistDto, user: { userId?: ObjectId }) {

        const { hotel_or_car } = body;

        const hotel_and_car = await this.hotelAndCarsService.getHotelOrCarById(hotel_or_car)

        if (!hotel_and_car) {
            throw new BadRequestException('Invalid Id')
        }

        const whishlistExists = await this.whishlistModel.findOne({ user_id: user.userId, is_deleted: false })


        let whishlist

        if (!whishlistExists) {
            if (hotel_and_car?.type === RecordType.H) {

                whishlist = await new this.whishlistModel(
                    {
                        user_id: user.userId,
                        hotels: [hotel_and_car._id],
                        created_by: user.userId
                    }).save();



            }

            else {

                whishlist = await new this.whishlistModel(
                    {
                        user_id: user.userId,
                        $push: { cars: hotel_and_car._id },
                        created_by: user.userId
                    }).save();

            }

        }

        else {
            if (hotel_and_car?.type === RecordType.H) {

                whishlist = await this.whishlistModel.findByIdAndUpdate(
                    { _id: whishlistExists._id },
                    {
                        $push: { hotels: hotel_and_car._id },
                    },
                    {
                        new: true
                    });



            }

            else {


                whishlist = await this.whishlistModel.findByIdAndUpdate(
                    { _id: whishlistExists._id },
                    {
                        $push: { cars: hotel_and_car._id },
                    },
                    {
                        new: true
                    });


            }

        }


        return whishlist

    }

    async removeWhishlist(body: CreateWhishlistDto, user: { userId?: ObjectId }) {

        const { hotel_or_car } = body;

        const hotel_and_car = await this.hotelAndCarsService.getHotelOrCarById(hotel_or_car)

        if (!hotel_and_car) {
            throw new BadRequestException('Invalid Id')
        }

        const whishlistExists = await this.whishlistModel.findOne({ user_id: user.userId, is_deleted: false })


        if (!whishlistExists) {
            throw new BadRequestException('Whishlist is empty')
        }


        let whishlist

        if (hotel_and_car?.type === RecordType.H) {

            whishlist = await this.whishlistModel.findByIdAndUpdate(
                { _id: whishlistExists._id },
                {
                    $pull: { hotels: hotel_and_car._id },
                },
                {
                    new: true
                });

        }

        else {

            whishlist = await this.whishlistModel.findByIdAndUpdate(
                { _id: whishlistExists._id },
                {
                    $pull: { cars: hotel_and_car._id },
                },
                {
                    new: true
                });


        }



        return whishlist

    }



}
