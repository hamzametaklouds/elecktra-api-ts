import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { PlanTripDto } from './dtos/book-trip.dto';
import { Model, ObjectId } from 'mongoose';
import { HOTEL_AND_CARS_PROVIDER_TOKEN } from './hotel-and-cars.constants';
import { IHotelAndCars, RecordType } from './hotel-and-cars.schema';
import { CreateHotelAndCarDto } from './dtos/create-hotel-or-car.dto';
import { matchFilters } from 'src/app/mongo.utils';
import { WhishlistService } from 'src/whishlist/whishlist.service';
import { PlanCarTripDto } from './dtos/book-car.dto';
import { RecentSearchsService } from 'src/recent-searchs/recent-searchs.service';
import { CreateIdealCarDto } from './dtos/create-car-ideal.dto';
import { UpdateIdealCarDto } from './dtos/update-car-ideal.dto';
import { UpdateHotelAndCarDto } from './dtos/update-hotel-or-car.dto';
const moment = require('moment');

@Injectable()
export class HotelAndCarsService {

    constructor(
        @Inject(HOTEL_AND_CARS_PROVIDER_TOKEN)
        private hotelAndCarsModel: Model<IHotelAndCars>,
        @Inject(forwardRef(() => WhishlistService))
        private wishListService: WhishlistService,
        private recentSearchService: RecentSearchsService
    ) { }


    async getHotelOrCarById(id) {

        return await this.hotelAndCarsModel.findOne({ _id: id, is_deleted: false })

    }

    async planTrip(body: PlanTripDto, user: { userId?: ObjectId }, $filter, $sortBy) {
        try {
            const {
                place_title,
                address,
                start_date,
                end_date,
                adults,
                children,
                infants,
                lat,
                long
            } = body;

            let hotel = [];

            $filter['is_available'] = true;
            $filter = matchFilters($filter);

            console.log('$filter-------', $filter);

            let rating = 5// Default filter
            if ($filter['rating']) {

                rating = $filter['rating']['$lt']
                delete $filter.rating; // Remove rating from the original filter
            }


            const userWishList = await this.wishListService.getWishlistById(user.userId);

            if (start_date && end_date) {
                // Validate and parse start_date and end_date
                if (!moment(start_date, moment.ISO_8601, true).isValid() ||
                    !moment(end_date, moment.ISO_8601, true).isValid()) {
                    throw new BadRequestException("Invalid date format. Please use ISO 8601 format (e.g., 2024-12-04T00:00:00.000Z).");
                }

                const startDate = moment.utc(start_date).startOf('day').toDate();
                const endDate = moment.utc(end_date).endOf('day').toDate();

                try {
                    hotel = await this.hotelAndCarsModel.aggregate([
                        {
                            $geoNear: {
                                near: { type: "Point", coordinates: [long, lat] },
                                distanceField: "dist.calculated",
                                maxDistance: 50000, // Correct placement of maxDistance
                                spherical: true,
                                query: {
                                    is_deleted: false,
                                    ...$filter,
                                    type: RecordType.H,
                                },
                            },
                        },
                        { $sort: { "dist.calculated": 1 } },
                        {
                            $match: {
                                $or: [
                                    { unavailability_calendar: { $exists: false } },
                                    { unavailability_calendar: { $eq: null } },
                                    {
                                        $expr: {
                                            $not: {
                                                $in: [new Date(), "$unavailability_calendar"],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "rating_reviews",
                                localField: "_id",
                                foreignField: "hotel_or_car",
                                pipeline: [{ $sort: { created_at: -1 } }],
                                as: "reviews",
                            },
                        },
                        {
                            $unwind: {
                                path: "$reviews",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $group: {
                                _id: "$_id",
                                title: { $first: "$title" },
                                description: { $first: "$description" },
                                address: { $first: "$address" },
                                images: { $first: "$images" },
                                highlights: { $first: "$highlights" },
                                price: { $first: "$price" },
                                location: { $first: "$location" },
                                hotel_type: { $first: "$hotel_type" },
                                is_deleted: { $first: "$is_deleted" },
                                distance: { $first: "$dist.calculated" },
                                created_by: { $first: "$created_by" },
                                total_reviews: {
                                    $sum: { $cond: [{ $ifNull: ["$reviews", false] }, 1, 0] },
                                },
                                rating: { $avg: "$reviews.rating" }, // Calculate the average rating
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
                                ratings: { $ifNull: ["$rating", 0] }, // Use 0 if there are no reviews
                                total_reviews: 1,
                                location: 1,
                                hotel_type: 1,
                                is_in_wishlist: { $literal: false },
                                distance: 1,
                                created_by: 1,
                            },
                        },
                        {
                            $match: { ratings: { $lte: 5 } },
                        },
                    ]);

                } catch (error) {
                    console.error("Error during aggregation:", error);
                    throw new BadRequestException("Could not fetch hotels");
                }
            }

            else {
                try {
                    hotel = await this.hotelAndCarsModel.aggregate([
                        {
                            $geoNear: {
                                near: { type: "Point", coordinates: [long, lat] },
                                distanceField: "dist.calculated",
                                maxDistance: 50000, // Correct placement of maxDistance
                                spherical: true,
                                query: {
                                    is_deleted: false,
                                    ...$filter,
                                    type: RecordType.H,
                                },
                            },
                        },
                        { $sort: { "dist.calculated": 1 } },
                        {
                            $match: {
                                $or: [
                                    { unavailability_calendar: { $exists: false } },
                                    { unavailability_calendar: { $eq: null } },
                                    {
                                        $expr: {
                                            $not: {
                                                $in: [new Date(), "$unavailability_calendar"],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "rating_reviews",
                                localField: "_id",
                                foreignField: "hotel_or_car",
                                pipeline: [{ $sort: { created_at: -1 } }],
                                as: "reviews",
                            },
                        },
                        {
                            $unwind: {
                                path: "$reviews",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $group: {
                                _id: "$_id",
                                title: { $first: "$title" },
                                description: { $first: "$description" },
                                address: { $first: "$address" },
                                images: { $first: "$images" },
                                highlights: { $first: "$highlights" },
                                price: { $first: "$price" },
                                location: { $first: "$location" },
                                hotel_type: { $first: "$hotel_type" },
                                is_deleted: { $first: "$is_deleted" },
                                distance: { $first: "$dist.calculated" },
                                created_by: { $first: "$created_by" },
                                total_reviews: {
                                    $sum: { $cond: [{ $ifNull: ["$reviews", false] }, 1, 0] },
                                },
                                rating: { $avg: "$reviews.rating" }, // Calculate the average rating
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
                                ratings: { $ifNull: ["$rating", 0] }, // Use 0 if there are no reviews
                                total_reviews: 1,
                                location: 1,
                                hotel_type: 1,
                                is_in_wishlist: { $literal: false },
                                distance: 1,
                                created_by: 1,
                            },
                        },
                        {
                            $match: { ratings: { $lte: 5 } },
                        },
                    ]);


                } catch (error) {
                    console.error("Error during aggregation without date filters:", error);
                    throw new Error("Could not fetch hotels");
                }
            }

            if (userWishList) {
                hotel.forEach((value) => {
                    userWishList.hotels.forEach((hotel) => {
                        if (hotel.toString() === value._id.toString()) {
                            value.is_in_wishlist = true;
                        }
                    });
                });
            }

            this.recentSearchService.insertSearch(
                {
                    title: place_title || null,
                    address: address || null,
                    adults,
                    children,
                    infants,
                    start_date,
                    end_date,
                    type: 'Stay',
                    location: { type: 'Point', coordinates: [long, lat] }
                },
                user
            );


            return hotel;

        } catch (err) {
            console.error("Error during the plan trip process:", err);
            throw new BadRequestException(err.message);
        }
    }



    async getPaginatedUsers(rpp: number, page: number, $filter: Object, orderBy, user) {

        const filter: Record<string, any> = $filter;

        console.log('filter----', $filter)

        if (!user?.company_id && !('type' in filter || filter?.$and?.[0]?.type)) {
            throw new BadRequestException('Type must be specified');
        }

        if (user?.company_id) {
            filter['company_id'] = user?.company_id
        }

        const skip: number = (page - 1) * rpp;
        const totalDocuments: number = await this.hotelAndCarsModel.countDocuments($filter);
        const totalPages: number = Math.ceil(totalDocuments / rpp);
        page = page > totalPages ? totalPages : page;



        const bandCategorySection = await this.hotelAndCarsModel
            .find(filter, { _id: 1, title: 1, description: 1, unavailability_calendar: 1, type: 1, price: 1, availability_from: 1, availability_till: 1, check_in_time: 1, hotel_details: 1, check_out_time: 1, company_id: 1, created_at: 1, created_by: 1, is_disabled: 1, is_available: 1 })
            .sort(orderBy)
            .skip(skip)
            .limit(rpp)
            .populate({ path: 'company_id', select: '_id title description icon' })
            .populate({ path: 'created_by', select: '_id first_name last_name email' })

        return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: bandCategorySection };

    }

    /**
     *The purpose of this method is to return bandCategory based on filter
     * @param $filter filter query as an argument
     * @param $orderBy orderby as an argument
     * @returns bandCategory based on filter
     */
    async getFilteredUsers(filter: Object, $orderBy, user) {




        const $filter: Record<string, any> = filter;

        console.log('filter----', $filter)

        if (!user?.company_id && !('type' in $filter || $filter?.$and?.[0]?.type)) {
            throw new BadRequestException('Type must be specified');
        }

        if (user?.company_id) {
            $filter['company_id'] = user?.company_id
        }


        return await this.hotelAndCarsModel
            .find($filter, { _id: 1, title: 1, description: 1, unavailability_calendar: 1, company_id: 1, availability_from: 1, availability_till: 1, check_in_time: 1, hotel_details: 1, type: 1, price: 1, created_at: 1, created_by: 1, is_disabled: 1, is_available: 1 })
            .sort($orderBy)
            .populate({ path: 'company_id', select: '_id title description icon' })
            .populate({ path: 'created_by', select: '_id first_name last_name email' })

    }
    async planCarTrip(body: PlanCarTripDto, user: { userId?: ObjectId }, $filter, $sortBy) {
        try {
            const {
                place_title,
                address,
                start_date,
                end_date,
                lat,
                long
            } = body;

            let hotel = [];
            $filter = matchFilters($filter);

            const userWishList = await this.wishListService.getWishlistById(user.userId);

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
                            maxDistance: 50000,
                            spherical: true,
                            query: {
                                is_deleted: false,
                                type: RecordType.C
                            },
                        },
                    },
                    { $sort: { "dist.calculated": 1 } },
                    {
                        $addFields: {
                            year: '$car_details.year',
                            seats: '$car_details.seats',
                            mileage: '$car_details.mileage',
                            fuel_type: '$car_details.fuel_type',
                            make: '$car_details.make',
                            transmission: '$car_details.transmission'
                        }
                    },
                    { $match: $filter },
                    {
                        $lookup: {
                            from: 'options',
                            localField: 'fuel_type',
                            foreignField: '_id',
                            as: 'fuel_type',
                        },
                    },
                    { $unwind: { path: '$fuel_type', preserveNullAndEmptyArrays: true } }, // Preserve nulls
                    {
                        $lookup: {
                            from: 'options',
                            localField: 'make',
                            foreignField: '_id',
                            as: 'make',
                        },
                    },
                    { $unwind: { path: '$make', preserveNullAndEmptyArrays: true } }, // Preserve nulls
                    {
                        $lookup: {
                            from: 'options',
                            localField: 'transmission',
                            foreignField: '_id',
                            as: 'transmission',
                        },
                    },
                    { $unwind: { path: '$transmission', preserveNullAndEmptyArrays: true } }, // Preserve nulls
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
                            created_by: 1,  // Include created_by for wishlist check
                            car_details: {
                                year: '$car_details.year',
                                seats: '$car_details.seats',
                                mileage: '$car_details.mileage',
                                fuel_type: '$fuel_type.title',
                                make: '$make.title',
                                transmission: '$transmission.title',
                                duration_conditions: '$car_details.duration_conditions',
                                owner_rules: '$car_details.owner_rules'
                            }
                        }
                    }
                ]);

            } catch (error) {
                console.error("Error during aggregation without date filters:", error);
                throw new Error("Could not fetch cars");
            }

            console.log('\n\n\nI AM IN-------', userWishList)

            if (userWishList) {
                hotel.forEach((value) => {
                    console.log('\n\n\nI AM IN---', value._id)

                    userWishList.cars.forEach((car) => {
                        if (car.toString() === value._id.toString()) {
                            console.log('\n\n\nINnnnnnnnnn')
                            value.is_in_wishlist = true;
                        }
                    })
                });
            }

            this.recentSearchService.insertSearch(
                {
                    title: place_title || null,
                    address: address || null,
                    adults: null,
                    children: null,
                    infants: null,
                    start_date,
                    end_date,
                    type: 'Car',
                    location: {
                        type: 'Point',
                        coordinates: [long, lat]
                    }
                },
                user
            );

            console.log("Cars found:", hotel);
            return hotel;

        } catch (err) {
            throw new BadRequestException(err);
        }
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
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                icon: 1,
                                parent_type: 1,
                                sub_type: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'rating_reviews',
                    localField: '_id',
                    foreignField: 'hotel_or_car',
                    pipeline: [{ $sort: { created_at: -1 } }],
                    as: 'reviews'
                },
            },
            {
                $unwind: {
                    path: "$reviews",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reviews.created_by',
                    foreignField: '_id',
                    as: 'user_details'
                },
            },
            {
                $unwind: {
                    path: "$user_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_details'
                },
            },
            {
                $unwind: {
                    path: "$company_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "reviews.name": "$user_details.name"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    address: { $first: "$address" },
                    bedrooms_available: { $first: "$total_rooms" },
                    images: { $first: "$images" },
                    highlights: { $first: "$highlights" },
                    price: { $first: "$price" },
                    ratings: { $avg: "$reviews.rating" },
                    total_reviews: { $sum: { $cond: [{ $ifNull: ["$reviews", false] }, 1, 0] } },
                    check_in_time: { $first: { $ifNull: ["$check_in_time", null] } },
                    check_out_time: { $first: { $ifNull: ["$check_out_time", null] } },
                    availability_from: { $first: { $ifNull: ["$availability_from", null] } },
                    availability_till: { $first: { $ifNull: ["$availability_till", null] } },
                    unavailability_calendar: { $first: "$unavailability_calendar" },
                    hotel_details: { $first: "$hotel_details" },
                    location: { $first: "$location" },
                    hotel_type: { $first: "$hotel_type" },
                    is_in_wishlist: { $first: { $literal: false } },
                    amenities: { $first: "$amenities" },
                    reviews: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$reviews", false] },
                                {
                                    _id: "$reviews._id",
                                    rating: "$reviews.rating",
                                    review: "$reviews.review",
                                    name: "$reviews.name"
                                },
                                null
                            ]
                        }
                    },
                    cancellation_policy: { $first: "$hotel_details.cancellation_policy" },
                    host_details: {
                        $first: {
                            _id: "$company_details._id",
                            name: "$company_details.title",
                            years_of_experience: 7
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    address: 1,
                    bedrooms_available: 1,
                    images: 1,
                    highlights: 1,
                    price: 1,
                    ratings: { $round: [{ $ifNull: ["$ratings", 0] }, 2] }, // Default rating to 0
                    total_reviews: 1,
                    check_in_time: 1,
                    check_out_time: 1,
                    availability_from: 1,
                    availability_till: 1,
                    unavailability_calendar: 1,
                    hotel_details: 1,
                    location: 1,
                    hotel_type: 1,
                    is_in_wishlist: 1,
                    amenities: 1,
                    reviews: { $ifNull: ["$reviews", []] }, // Default reviews to empty array
                    cancellation_policy: 1,
                    host_details: 1
                }
            }
        ]);



        const userWishList = await this.wishListService.getWishlistById(user.userId)

        if (user?.userId?.toString() !== '67272691b1673e7c1353639a' && userWishList?.hotels) {
            hotel[0].is_in_wishlist = userWishList?.hotels?.includes(hotel[0]._id);
        }





        return hotel

    }

    async getIdealCars() {



        return await this.hotelAndCarsModel.aggregate([
            // Filter documents based on the conditions
            {
                $match: {
                    is_ideal: true,
                    type: RecordType.C,
                    is_deleted: false,
                    is_disabled: false
                }
            },
            // Project the required fields
            {
                $project: {
                    title: 1,
                    images: 1,
                    address: 1,
                    price: 1,
                    car_details: 1,
                    rating: 1, // Directly add static value
                    reviews: 1, // Directly add static value
                    created_at: 1
                }
            },
            // Sort by `created_at` in descending order
            {
                $sort: { created_at: -1 }
            },
            // Lookup amenities data
            // Lookup car_details data for `fuel_type`
            {
                $lookup: {
                    from: 'options', // Assume 'car_details' collection exists for fuel type and transmission
                    localField: 'car_details.fuel_type',
                    foreignField: '_id',
                    as: 'car_details.fuel_type',
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1 } } // Select specific fields in fuel type
                    ]
                }
            },
            // Lookup car_details data for `transmission`
            {
                $lookup: {
                    from: 'options',
                    localField: 'car_details.transmission',
                    foreignField: '_id',
                    as: 'car_details.transmission',
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1 } } // Select specific fields in transmission
                    ]
                }
            }
        ]);

    }

    async hotelCarDetail(hotel_id: string, user: { userId?: ObjectId }) {
        const hotelExists = await this.hotelAndCarsModel.findOne({ _id: hotel_id, is_deleted: false });

        if (!hotelExists) {
            throw new BadRequestException('Invalid Id');
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
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1, icon: 1, parent_type: 1, sub_type: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'amenities',
                    foreignField: '_id',
                    as: 'amenities',
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1, icon: 1, parent_type: 1, sub_type: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'car_details.fuel_type',
                    foreignField: '_id',
                    as: 'car_details.fuel_type',
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'car_details.transmission',
                    foreignField: '_id',
                    as: 'car_details.transmission',
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'car_details.make',
                    foreignField: '_id',
                    as: 'car_details.make',
                    pipeline: [
                        { $project: { _id: 1, title: 1, description: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_details'
                },
            },
            {
                $unwind: {
                    path: "$company_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    address: { $first: "$address" },
                    images: { $first: "$images" },
                    highlights: { $first: "$highlights" },
                    price: { $first: "$price" },
                    car_details: { $first: "$car_details" },
                    ratings: { $avg: "$reviews.rating" },
                    total_reviews: { $sum: { $cond: [{ $ifNull: ["$reviews", false] }, 1, 0] } },
                    location: { $first: "$location" },
                    is_in_wishlist: { $first: { $literal: false } },
                    car_options: { $first: "$car_options" },
                    check_in_time: { $first: { $ifNull: ["$check_in_time", null] } },
                    check_out_time: { $first: { $ifNull: ["$check_out_time", null] } },
                    availability_from: { $first: { $ifNull: ["$availability_from", null] } },
                    availability_till: { $first: { $ifNull: ["$availability_till", null] } },
                    amenities: { $first: "$amenities" },
                    reviews: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$reviews", false] },
                                {
                                    _id: "$reviews._id",
                                    rating: "$reviews.rating",
                                    review: "$reviews.review",
                                    name: "$reviews.name"
                                },
                                null
                            ]
                        }
                    },
                    owner_details: {
                        $first: {
                            _id: "$company_details._id",
                            name: "$company_details.title",
                            years_of_experience: 7
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    address: 1,
                    images: 1,
                    highlights: 1,
                    check_in_time: 1,
                    check_out_time: 1,
                    availability_from: 1,
                    availability_till: 1,
                    price: 1,
                    car_details: 1,
                    ratings: { $round: [{ $ifNull: ["$ratings", 0] }, 2] },
                    total_reviews: 1,
                    location: 1,
                    is_in_wishlist: 1,
                    car_options: 1,
                    reviews: { $ifNull: ["$reviews", []] },
                    amenities: 1,
                    owner_details: 1
                }
            }
        ]);

        const userWishList = await this.wishListService.getWishlistById(user.userId);

        if (user?.userId?.toString() !== '67272691b1673e7c1353639a' && userWishList?.cars) {
            hotel[0].is_in_wishlist = userWishList?.cars?.includes(hotel[0]?._id);
        }

        return hotel;
    }




    async insertOption(body: CreateHotelAndCarDto, user: { userId?: ObjectId }) {
        const {
            title,
            description,
            images,
            address,
            highlights,
            amenities,
            unavailability_calendar,
            car_options,
            type,
            lat,
            long,
            check_in_time,
            check_out_time,
            price,
            total_rooms,
            rooms_reserved,
            hotel_type,
            company_id,
            availability_from,
            availability_till,
            host_or_owner,
            car_details,
            hotel_details,
        } = body;

        // Validate latitude and longitude
        if (lat < -90 || lat > 90) {
            throw new BadRequestException('Latitude must be between -90 and 90');
        }
        if (long < -180 || long > 180) {
            throw new BadRequestException('Longitude must be between -180 and 180');
        }

        const screen = await new this.hotelAndCarsModel({
            title,
            description,
            images,
            address,
            highlights,
            amenities,
            hotel_type,
            car_options,
            check_in_time,
            check_out_time,
            type,
            unavailability_calendar,
            location: {
                type: 'Point',
                coordinates: [long, lat],
            },
            lat,
            long,
            price,
            total_rooms,
            company_id,
            rooms_reserved,
            availability_from: availability_from ? new Date(availability_from) : null,
            availability_till: availability_till ? new Date(availability_till) : null,
            host_or_owner,
            car_details,
            hotel_details,
            created_by: user?.userId || null,
        }).save();

        return screen;
    }



    async insertIdealCar(body: CreateIdealCarDto, user: { userId?: ObjectId }) {
        const {
            title,
            images,
            address,
            rating,
            reviews,
            price,
            car_details,
        } = body;

        const screen = await new this.hotelAndCarsModel({
            title,
            images,
            address,
            rating,
            reviews,
            location: { type: 'Point', coordinates: [-90, 90] },  // Set to null explicitly
            type: RecordType.C,
            price,
            is_ideal: true,
            car_details,
            created_by: user?.userId || null,
        }).save();

        return screen;
    }

    async updateIdealCar(id, body: UpdateIdealCarDto, user: { userId?: ObjectId }) {

        const car = await this.hotelAndCarsModel.findOne({ _id: id, is_deleted: false })


        if (!car) {
            throw new BadRequestException('Invalid id')
        }

        const {
            title,
            images,
            address,
            rating,
            reviews,
            price,
            car_details,
            is_deleted,
            is_disabled,

        } = body;

        const screen = await this.hotelAndCarsModel.findByIdAndUpdate(
            {
                _id: car._id
            },
            {
                title,
                images,
                address,
                rating,
                reviews,
                type: RecordType.C,
                price,
                is_ideal: true,
                car_details,
                is_deleted,
                is_disabled,
                updated_by: user?.userId || null
            },
            {
                new: true
            }
        );


        return screen

    }

    async updateOption(id, body: UpdateHotelAndCarDto, user: { userId?: ObjectId }) {


        const optionExist = await this.hotelAndCarsModel.findOne({ _id: id, is_deleted: false });

        if (!optionExist) {
            throw new BadRequestException('Invalid Id');
        }

        const {
            title, description, images, address, highlights, amenities, car_options, type, lat, long,
            price, total_rooms, rooms_reserved, hotel_type, availability_from, availability_till,
            unavailability_calendar, check_in_time,
            check_out_time,
            host_or_owner, is_available, car_details, hotel_details, is_deleted, is_disabled
        } = body;

        // Validate latitude and longitude
        if (lat < -90 || lat > 90) {
            throw new BadRequestException('Latitude must be between -90 and 90');
        }
        if (long < -180 || long > 180) {
            throw new BadRequestException('Longitude must be between -180 and 180');
        }
        // Check if both lat and long are provided, else set a default or throw an error
        const location = lat && long ? { type: 'Point', coordinates: [long, lat] } : optionExist.location;

        if (!location.coordinates || location.coordinates.length !== 2) {
            throw new BadRequestException('Latitude and Longitude must be specified');
        }

        console.log('hotel_details----', hotel_details)

        const updatedOption = await this.hotelAndCarsModel.findByIdAndUpdate(
            { _id: optionExist._id },
            {
                title, description, images, address, highlights, amenities, unavailability_calendar, hotel_type, car_options, type,
                lat, long, price, total_rooms, is_available, rooms_reserved, check_in_time,
                check_out_time,
                location, // Pass the validated or existing location here
                availability_from: availability_from ? new Date(availability_from) : null,
                availability_till: availability_till ? new Date(availability_till) : null,
                host_or_owner, car_details, hotel_details, is_deleted, is_disabled,
                created_by: user?.userId || null
            },
            { new: true }
        );

        return updatedOption;
    }


}

