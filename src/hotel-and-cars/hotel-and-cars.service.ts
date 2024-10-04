import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { PlanTripDto } from './dtos/book-trip.dto';
import { Model, ObjectId } from 'mongoose';
import { HOTEL_AND_CARS_PROVIDER_TOKEN } from './hotel-and-cars.constants';
import { IHotelAndCars, RecordType } from './hotel-and-cars.schema';
import { CreateHotelAndCarDto } from './dtos/create-hotel-or-car.dto';
import { matchFilters } from 'src/app/mongo.utils';
import { WhishlistService } from 'src/whishlist/whishlist.service';
import { PlanCarTripDto } from './dtos/book-car.dto';
const moment = require('moment');

@Injectable()
export class HotelAndCarsService {

    constructor(
        @Inject(HOTEL_AND_CARS_PROVIDER_TOKEN)
        private hotelAndCarsModel: Model<IHotelAndCars>,
        @Inject(forwardRef(() => WhishlistService))
        private wishListService: WhishlistService
    ) { }


    async getHotelOrCarById(id) {

        return await this.hotelAndCarsModel.findOne({ _id: id, is_deleted: false })

    }

    async planTrip(body: PlanTripDto, user: { userId?: ObjectId }, $filter, $sortBy) {
        const {
            start_date,
            end_date,
            adults,
            children,
            infants,
            lat,
            long
        } = body;

        let hotel = [];

        $filter = matchFilters($filter);

        const userWishList = await this.wishListService.getWishlistById(user.userId)

        if ((start_date && start_date !== '') && (end_date && end_date !== '')) {
            const startDate = moment(start_date).utc().startOf('day').toDate();
            const endDate = moment(end_date).utc().endOf('day').toDate();

            console.log("Start Date:", startDate);
            console.log("End Date:", endDate);
            console.log("Longitude:", long);
            console.log("Latitude:", lat);

            try {
                hotel = await this.hotelAndCarsModel.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [long, lat]
                            },
                            distanceField: "dist.calculated",
                            maxDistance: 50000, // Adjust distance as needed
                            spherical: true,
                            query: {
                                is_deleted: false,
                                ...$filter,
                                availability_from: { $lte: endDate },  // Ensure available from before or on endDate
                                availability_till: { $gte: startDate }, // Ensure available till after or on startDate,
                                type: RecordType.H
                            },
                        },
                    },
                    {
                        $sort: { "dist.calculated": 1 }
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1,
                            address: 1,
                            images: 1,
                            highlights: 1,
                            price: 1,
                            ratings: { $literal: 3.2 },
                            total_reviews: { $literal: 321 },
                            location: 1,
                            hotel_type: 1,
                            is_in_wishlist: { $literal: false },
                            distance: "$dist.calculated"
                        }
                    }
                ]);

            } catch (error) {
                console.error("Error during aggregation:", error);
                throw new Error("Could not fetch hotels");
            }
        }
        else {
            try {
                hotel = await this.hotelAndCarsModel.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [long, lat]
                            },
                            distanceField: "dist.calculated",
                            maxDistance: 50000, // Adjust distance as needed
                            spherical: true,
                            query: {
                                is_deleted: false,
                                ...$filter,
                                type: RecordType.H
                            },
                        },
                    },
                    {
                        $sort: { "dist.calculated": 1 }
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1,
                            address: 1,
                            bedrooms_available: '$total_rooms',
                            images: 1,
                            highlights: 1,
                            price: 1,
                            ratings: { $literal: 3.2 },
                            total_reviews: { $literal: 321 },
                            location: 1,
                            hotel_type: 1,
                            is_in_wishlist: { $literal: false }
                        }
                    }
                ]);
            } catch (error) {
                console.error("Error during aggregation without date filters:", error);
                throw new Error("Could not fetch hotels");
            }
        }

        if (userWishList) {
            hotel.forEach((value) => {
                // Check if the hotel's _id exists in the userWishlist.hotels array
                value.is_in_wishlist = userWishList.hotels.includes(value._id);
            });
        }

        console.log("Hotels found:", hotel);
        return hotel;
    }

    async planCarTrip(body: PlanCarTripDto, user: { userId?: ObjectId }, $filter, $sortBy) {
        const {
            start_date,
            end_date,
            lat,
            long
        } = body;

        let hotel = [];

        $filter = matchFilters($filter);

        const userWishList = await this.wishListService.getWishlistById(user.userId)

        const startDate = moment(start_date).utc().startOf('day').toDate();
        const endDate = moment(end_date).utc().endOf('day').toDate();


        try {
            hotel = await this.hotelAndCarsModel.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [long, lat]
                        },
                        distanceField: "dist.calculated",
                        maxDistance: 50000, // Adjust distance as needed
                        spherical: true,
                        query: {
                            is_deleted: false,
                            ...$filter,
                            availability_from: { $lte: endDate },
                            availability_till: { $gte: startDate },
                            type: RecordType.C
                        },
                    },
                },
                {
                    $sort: { "dist.calculated": 1 }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        address: 1,
                        images: 1,
                        highlights: 1,
                        price: 1,
                        ratings: { $literal: 3.2 },
                        total_reviews: { $literal: 321 },
                        location: 1,
                        is_in_wishlist: { $literal: false },
                        car_details: 1

                    }
                }
            ]);
        } catch (error) {
            console.error("Error during aggregation without date filters:", error);
            throw new Error("Could not fetch hotels");
        }


        if (userWishList) {
            hotel.forEach((value) => {
                // Check if the hotel's _id exists in the userWishlist.hotels array
                value.is_in_wishlist = userWishList.cars.includes(value._id);
            });
        }

        console.log("Hotels found:", hotel);
        return hotel;
    }


    async hotelDetail(hotel_id: string, user: { userId?: ObjectId }) {

        const hotelExists = await this.hotelAndCarsModel.findOne({ _id: hotel_id, is_deleted: false })

        if (!hotelExists) {
            throw new BadRequestException('Invalid Id')
        }


        const hotel = await this.hotelAndCarsModel.aggregate([
            {
                $match: { _id: hotelExists._id, is_deleted: false }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'amenities',
                    foreignField: '_id',
                    as: 'amenities',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    address: 1,
                    bedrooms_available: '$total_rooms',
                    images: 1,
                    highlights: 1,
                    price: 1,
                    ratings: 3.2,
                    total_reviews: 321,
                    location: 1,
                    hotel_type: 1,
                    is_in_wishlist: { $literal: false },
                    amenities: 1,
                    reviews: [
                        {
                            name: 'John doe',
                            rating: 3.4,
                            review: 'Exellent place'
                        },
                        {
                            name: 'Muhammad Junaid',
                            rating: 4,
                            review: 'There is still room for improvement'
                        }
                    ],
                    availablity_from: 1,
                    availablity_till: 1,
                    cancellation_policy: '$hotel_details.cancellation_policy',
                    host_details: {
                        name: 'Hamza Sohail',
                        years_of_experience: 7,

                    }

                }
            }
        ])

        const userWishList = await this.wishListService.getWishlistById(user.userId)

        hotel[0].is_in_wishlist = userWishList.hotels.includes(hotel[0]._id);




        // const hotels = {
        //     title: 'Hotel 1 in times square',
        //     description: '3 star hotel',
        //     address: 'Central New York City',
        //     bedrooms_available: 45,
        //     images: [
        //         'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
        //         'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
        //         'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
        //     ],
        //     highlights: [{
        //         icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
        //         detail: 'Hot tub'
        //     },
        //     {
        //         icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //         detail: 'Washer and Dryer'
        //     }],
        //     price: 12,
        //     ratings: 3.2,
        //     total_reviews: 321,
        //     lat: 36.98,
        //     long: 38.76,
        //     amenities: [
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Wifi'
        //         },
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Kitchen'
        //         },
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Refrigerator'
        //         },
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Dryer'
        //         }
        //     ],
        //     reviews: [
        //         {
        //             name: 'John doe',
        //             rating: 3.4,
        //             review: 'Exellent place'
        //         },
        //         {
        //             name: 'Muhammad Junaid',
        //             rating: 4,
        //             review: 'There is still room for improvement'
        //         }
        //     ],
        //     availablity_from: '',
        //     availablity_till: '',
        //     cancellation_policy: 'jnfskj jk ttkje kjkj kjs fkjs kjf skj fkj sfkjfs dfkjd skjs skj skjs kj ',
        //     host_details: {
        //         name: 'Hamza Sohail',
        //         years_of_experience: 7,

        //     }

        // }


        return hotel

    }

    async hotelCarDetail(hotel_id: string, user: { userId?: ObjectId }) {

        const hotelExists = await this.hotelAndCarsModel.findOne({ _id: hotel_id, is_deleted: false })

        if (!hotelExists) {
            throw new BadRequestException('Invalid Id')
        }


        const hotel = await this.hotelAndCarsModel.aggregate([
            {
                $match: { _id: hotelExists._id, is_deleted: false }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'car_options',
                    foreignField: '_id',
                    as: 'car_options',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    address: 1,
                    images: 1,
                    highlights: 1,
                    price: 1,
                    car_details: 1,
                    ratings: 3.2,
                    total_reviews: 321,
                    location: 1,
                    hotel_type: 1,
                    is_in_wishlist: { $literal: false },
                    car_options: 1,
                    reviews: [
                        {
                            name: 'John doe',
                            rating: 3.4,
                            review: 'Exellent place'
                        },
                        {
                            name: 'Muhammad Junaid',
                            rating: 4,
                            review: 'There is still room for improvement'
                        }
                    ],
                    owner_details: {
                        name: 'Hamza Sohail',

                    }

                }
            }
        ])

        const userWishList = await this.wishListService.getWishlistById(user.userId)

        hotel[0].is_in_wishlist = userWishList.cars.includes(hotel[0]._id);




        // const hotels = {
        //     title: 'Hotel 1 in times square',
        //     description: '3 star hotel',
        //     address: 'Central New York City',
        //     bedrooms_available: 45,
        //     images: [
        //         'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
        //         'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
        //         'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
        //     ],
        //     highlights: [{
        //         icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
        //         detail: 'Hot tub'
        //     },
        //     {
        //         icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //         detail: 'Washer and Dryer'
        //     }],
        //     price: 12,
        //     ratings: 3.2,
        //     total_reviews: 321,
        //     lat: 36.98,
        //     long: 38.76,
        //     amenities: [
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Wifi'
        //         },
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Kitchen'
        //         },
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Refrigerator'
        //         },
        //         {
        //             icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
        //             detail: 'Dryer'
        //         }
        //     ],
        //     reviews: [
        //         {
        //             name: 'John doe',
        //             rating: 3.4,
        //             review: 'Exellent place'
        //         },
        //         {
        //             name: 'Muhammad Junaid',
        //             rating: 4,
        //             review: 'There is still room for improvement'
        //         }
        //     ],
        //     availablity_from: '',
        //     availablity_till: '',
        //     cancellation_policy: 'jnfskj jk ttkje kjkj kjs fkjs kjf skj fkj sfkjfs dfkjd skjs skj skjs kj ',
        //     host_details: {
        //         name: 'Hamza Sohail',
        //         years_of_experience: 7,

        //     }

        // }


        return hotel

    }



    async insertOption(body: CreateHotelAndCarDto, user: { userId?: ObjectId }) {

        const {
            title,
            description,
            images,
            address,
            highlights,
            amenities,
            car_options,
            type,
            lat,
            long,
            price,
            total_rooms,
            rooms_reserved,
            hotel_type,
            availability_from,
            availability_till,
            host_or_owner,
            car_details,
            hotel_details,

        } = body;

        const screen = await new this.hotelAndCarsModel(
            {
                title,
                description,
                images,
                address,
                highlights,
                amenities,
                hotel_type,
                car_options,
                type,
                location: {
                    type: 'Point',
                    coordinates: [long, lat]
                },
                lat,
                long,
                price,
                total_rooms,
                rooms_reserved,
                availability_from: availability_from ? new Date(availability_from) : null,
                availability_till: availability_till ? new Date(availability_till) : null,
                host_or_owner,
                car_details,
                hotel_details,
                created_by: user?.userId || null
            }).save();


        return screen

    }
}

