import { Injectable, Inject, BadRequestException, forwardRef, UnauthorizedException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { BOOKINGS_PROVIDER_TOKEN } from './bookings.constants';
import { BookingStatus, BookingType, IBookings, IPayment } from './bookings.schema';
import { StripeService } from 'src/stripe/stripe.service';
import { HotelAndCarsService } from 'src/hotel-and-cars/hotel-and-cars.service';
import { CreatePaymentDto } from './dtos/create-payment';
import { UsersService } from 'src/users/users.service';
import { RecordType } from 'src/hotel-and-cars/hotel-and-cars.schema';

@Injectable()
export class BookingsService {

    constructor(
        @Inject(BOOKINGS_PROVIDER_TOKEN)
        private bookingModel: Model<IBookings>,
        @Inject(forwardRef(() => StripeService))
        private stripeService: StripeService,
        private hotelAndCarService: HotelAndCarsService,
        private userService: UsersService
    ) { }


    async getBookingById(id) {

        return await this.bookingModel.findOne({ _id: id, is_deleted: false })

    }

    async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy, user) {
        const skip: number = (page - 1) * rpp;
        const totalDocuments: number = await this.bookingModel.countDocuments(filter);
        const totalPages: number = Math.ceil(totalDocuments / rpp);
        page = page > totalPages ? totalPages : page;


        if (user?.company_id) {
            filter['company_id'] = user?.company_id
        }

        filter['status'] = { $ne: BookingStatus.CR }

        const bandCategorySection = await this.bookingModel
            .find(filter, { _id: 1, status: 1, company_payment: 1, nights: 1, sub_total: 1, reference_number: 1, start_date: 1, end_date: 1, type: 1, created_at: 1 })
            .sort(orderBy)
            .skip(skip)
            .limit(rpp)

        return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: bandCategorySection };

    }

    /**
     *The purpose of this method is to return bandCategory based on filter
     * @param $filter filter query as an argument
     * @param $orderBy orderby as an argument
     * @returns bandCategory based on filter
     */
    async getFilteredUsers($filter: Object, $orderBy, user) {


        $filter['status'] = { $ne: BookingStatus.CR }


        if (user?.company_id) {
            $filter['company_id'] = user?.company_id
        }


        return await this.bookingModel
            .find($filter, { _id: 1, status: 1, company_payment: 1, nights: 1, sub_total: 1, reference_number: 1, start_date: 1, end_date: 1, type: 1, created_at: 1 })
            .sort($orderBy)

    }

    async getBookingsForUser(user: { userId?: ObjectId }) {
        const userExists = await this.userService.getUserById(user.userId);
        const currentDate = new Date();

        const hotels = await this.bookingModel.aggregate([
            {
                $match: { created_by: userExists._id, type: BookingType.H }
            },
            {
                $lookup: {
                    from: 'hotel_and_cars',
                    localField: 'hotel_or_car',
                    foreignField: '_id',
                    as: 'hotel',
                },
            },
            { $unwind: '$hotel' },
            {
                $lookup: {
                    from: 'rating_reviews',
                    localField: '_id',
                    foreignField: 'booking_id',
                    as: 'review',
                },
            },
            { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    hotel_or_car: 1,
                    title: '$hotel.title',
                    description: '$hotel.description',
                    address: '$hotel.address',
                    price: '$hotel.price',
                    images: '$hotel.images',
                    guests: 1,
                    start_date: 1,
                    taxes_and_fees: 1,
                    reference_number: 1,
                    check_in_time: 1,
                    check_out_time: 1,
                    nights: 1,
                    type: 1,
                    sub_total: 1,
                    review: { $ifNull: ['$review', null] },
                    rating: { $ifNull: ['$review.rating', null] },
                    end_date: 1,
                    created_at: 1,
                    status: {
                        $cond: {
                            if: { $eq: ['$status', 'Cancelled'] },
                            then: 'Cancelled',
                            else: {
                                $cond: {
                                    if: { $eq: ['$status', 'Checkout'] },
                                    then: 'Past',
                                    else: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $lte: ['$start_date', currentDate] },
                                                    { $gte: ['$end_date', currentDate] }
                                                ]
                                            },
                                            'Live',
                                            {
                                                $cond: [
                                                    { $lt: ['$end_date', currentDate] },
                                                    'Past',
                                                    {
                                                        $cond: [
                                                            {
                                                                $lte: [
                                                                    {
                                                                        $dateDiff: {
                                                                            startDate: currentDate,
                                                                            endDate: '$start_date',
                                                                            unit: 'day'
                                                                        }
                                                                    },
                                                                    2
                                                                ]
                                                            },
                                                            'Upcoming',
                                                            'Upcoming'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        const cars = await this.bookingModel.aggregate([
            {
                $match: { created_by: userExists._id, type: BookingType.C }
            },
            {
                $lookup: {
                    from: 'hotel_and_cars',
                    localField: 'hotel_or_car',
                    foreignField: '_id',
                    as: 'car',
                },
            },
            { $unwind: '$car' },
            {
                $lookup: {
                    from: 'rating_reviews',
                    localField: '_id',
                    foreignField: 'booking_id',
                    as: 'review',
                },
            },
            { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    hotel_or_car: 1,
                    title: '$car.title',
                    description: '$car.description',
                    address: '$car.address',
                    price: '$car.price',
                    images: '$car.images',
                    highlights: '$car.highlights',
                    guests: 1,
                    start_date: 1,
                    review: { $ifNull: ['$review', null] },
                    rating: { $ifNull: ['$review.rating', null] },
                    taxes_and_fees: 1,
                    reference_number: 1,
                    nights: 1,
                    type: 1,
                    end_date: 1,
                    sub_total: 1,
                    created_at: 1,
                    status: {
                        $cond: {
                            if: { $eq: ['$status', 'Cancelled'] },
                            then: 'Cancelled',
                            else: {
                                $cond: {
                                    if: { $eq: ['$status', 'Checkout'] },
                                    then: 'Past',
                                    else: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $lte: ['$start_date', currentDate] },
                                                    { $gte: ['$end_date', currentDate] }
                                                ]
                                            },
                                            'Live',
                                            {
                                                $cond: [
                                                    { $lt: ['$end_date', currentDate] },
                                                    'Past',
                                                    {
                                                        $cond: [
                                                            {
                                                                $lte: [
                                                                    {
                                                                        $dateDiff: {
                                                                            startDate: currentDate,
                                                                            endDate: '$start_date',
                                                                            unit: 'day'
                                                                        }
                                                                    },
                                                                    2
                                                                ]
                                                            },
                                                            'Upcoming',
                                                            'Upcoming'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        return { hotels: hotels, cars: cars };
    }


    async updateBooking(body: IPayment, booking_id) {

        return await this.bookingModel.findByIdAndUpdate({ _id: booking_id }, { payment: body, status: BookingStatus.C })

    }

    async cancelBooking(booking_id, user: { userId?: ObjectId }) {

        const bookingExists = await this.bookingModel.findOne({ _id: booking_id, is_deleted: false })

        if (!bookingExists) {
            throw new BadRequestException('Invalid booking id')
        }

        if (bookingExists?.created_by?.toString() !== user.userId.toString()) {
            throw new UnauthorizedException('Unauthorized to cancel this booking')
        }

        // const currentDate = new Date();
        // const startsAtDate = new Date(bookingExists.start_date);

        // if (startsAtDate <= currentDate) {
        //     throw new BadRequestException('Booking cannot be cancelled as it has already started or passed');
        // }

        return await this.bookingModel.findByIdAndUpdate({ _id: bookingExists._id }, { status: BookingStatus.CN }, { new: true })

    }

    async checkoutBooking(booking_id, user: { userId?: ObjectId }) {

        const bookingExists = await this.bookingModel.findOne({ _id: booking_id, is_deleted: false })

        if (!bookingExists) {
            throw new BadRequestException('Invalid booking id')
        }

        if (bookingExists?.created_by?.toString() !== user.userId.toString()) {
            throw new UnauthorizedException('Unauthorized to checkout this booking')
        }

        const currentDate = new Date();
        const startsAtDate = new Date(bookingExists.start_date);
        const endsAtDate = new Date(bookingExists.end_date);

        // if (startsAtDate > currentDate) {
        //     throw new BadRequestException('Booking cannot be checked out as it has not yet started');
        // }

        // if (endsAtDate <= currentDate) {
        //     throw new BadRequestException('Booking cannot be checked out as it has already ended');
        // }

        return await this.bookingModel.findByIdAndUpdate({ _id: bookingExists._id }, { status: BookingStatus.CK }, { new: true })

    }


    async insertBooking(body: CreateBookingsDto, user: { userId?: ObjectId }) {

        const {
            hotel_or_car,
            start_date,
            end_date,
            adults,
            children,
            infants,
        } = body;

        const hotelExists = await this.hotelAndCarService.getHotelOrCarById(hotel_or_car)

        if (!hotelExists) {
            throw new BadRequestException('Invalid hotel Id')
        }


        const reference_number = Array.from({ length: 15 }, () => 'abcdefghijk123455678990lmnopqr0928340483stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('').toLowerCase();


        // const start = new Date(start_date);
        // const end = new Date(end_date);

        // if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        //     throw new Error('Invalid date format');
        // }

        // const diffInMs = end.getTime() - start.getTime();
        // const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        const start = new Date(start_date);
        const end = new Date(end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }

        // Set both dates to midnight
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffInMs = end.getTime() - start.getTime();
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));


        let sub_total = hotelExists?.price * diffInDays

        const tax = sub_total * 0.17

        sub_total = sub_total + tax


        let booking = await new this.bookingModel(
            {
                hotel_or_car,
                start_date,
                end_date,
                type: hotelExists?.type,
                company_id: hotelExists.company_id,
                reference_number: reference_number,
                guests: {
                    adults: adults,
                    children: children,
                    infants: infants
                },
                taxes_and_fees: {
                    tax_percentage: 17,
                    total_tax_applied: tax
                },
                sub_total: sub_total,
                check_in_time: hotelExists.check_in_time,
                check_out_time: hotelExists.check_out_time,
                nights: diffInDays,
                created_by: user.userId ? user.userId : null
            }).save();


        booking['rating'] = 4.3

        return booking

    }

    async verifyPayment(body: CreatePaymentDto, user: { userId?: ObjectId }) {

        try {
            const intent = await this.stripeService.createPaymentIntentPro(body, user)

            return intent

        }
        catch (err) {

            throw new BadRequestException(err?.message)
        }


    }


}
