import { Injectable, Inject, BadRequestException, forwardRef, UnauthorizedException } from '@nestjs/common';
import mongoose, { Model, ObjectId } from 'mongoose';
import { CreateBookingsDto } from './dtos/create-bookings.dto';
import { BOOKINGS_PROVIDER_TOKEN } from './bookings.constants';
import { ActualBookingStatus, BookingStatus, BookingType, CompanyPaymentStatus, IBookings, IPayment } from './bookings.schema';
import { StripeService } from 'src/stripe/stripe.service';
import { HotelAndCarsService } from 'src/hotel-and-cars/hotel-and-cars.service';
import { CreatePaymentDto } from './dtos/create-payment';
import { UsersService } from 'src/users/users.service';
import { RecordType } from 'src/hotel-and-cars/hotel-and-cars.schema';
import { UpdateCompanyPaymentDto } from './dtos/update-company-payment';
import { matchFilters } from 'src/app/mongo.utils';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateCompanyPaymentDto } from './dtos/company-payment.dto';

@Injectable()
export class BookingsService {

    constructor(
        @Inject(BOOKINGS_PROVIDER_TOKEN)
        private bookingModel: Model<IBookings>,
        @Inject(forwardRef(() => StripeService))
        private stripeService: StripeService,
        private hotelAndCarService: HotelAndCarsService,
        private userService: UsersService,
        private companiesService: CompaniesService
    ) { }


    async getBookingById(id) {

        return await this.bookingModel.findOne({ _id: id, is_deleted: false })

    }

    // async getDashBoardDetails(user) {

    //     const data = {
    //         common_cards: {
    //             total_completed_bookings: 100,
    //             total_sales: 100,
    //             pending_payment: 100,
    //             total_stays_listing: 100,
    //             total_earnings: [
    //                 { month: 'January', value: 450 },
    //                 { month: 'February', value: 530 },
    //                 { month: 'March', value: 620 },
    //                 { month: 'April', value: 480 },
    //                 { month: 'May', value: 550 },
    //                 { month: 'June', value: 600 },
    //                 { month: 'July', value: 650 },
    //                 { month: 'August', value: 700 },
    //                 { month: 'September', value: 560 },
    //                 { month: 'October', value: 600 },
    //                 { month: 'November', value: 650 },
    //                 { month: 'December', value: 700 }
    //             ]
    //             ,
    //             total_cars_listing: 100,
    //             in_progress_bookings: 100,
    //         },
    //         admin_cards: {
    //             pending_queries: 100,
    //             pending_host_requests: 100,
    //             pending_approvals: 100,
    //         },
    //     };

    //     return data;

    // }
    async getDashBoardDetails(user) {

        let companyFilter;
        if (user?.company_id) {
            if (mongoose.Types.ObjectId.isValid(user.company_id)) {
                companyFilter = { company_id: new mongoose.Types.ObjectId(user.company_id) }; // Convert to ObjectId
            } else {
                console.error('Invalid company_id format');
                throw new Error('Invalid company ID provided.');
            }
        }
        else {
            companyFilter = { is_disabled: false }
        }

        const result = await this.bookingModel.aggregate([
            // Match completed bookings with specific status
            {
                $match: {
                    is_deleted: false, ...companyFilter // Ensure we exclude deleted bookings
                }
            },
            {
                $project: {
                    sub_total: 1, // Include sub_total in the result
                    type: 1, // Booking type (Car or Hotel)
                    status: 1, // Booking status (Pending, Completed, etc.)
                    booking_status: 1, // Actual booking status (In Progress, Completed, etc.)
                }
            },
            {
                $group: {
                    _id: null, // No grouping, just aggregate totals
                    total_sales: { $sum: '$sub_total' }, // Sum of all sub_totals
                    pending_payments: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking_status', 'Pending'] }, // Check status as 'Pending'
                                '$sub_total', 0 // If status is 'Pending', add sub_total, else 0
                            ]
                        }
                    },
                    pending_payments_count: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking_status', 'Pending'] }, // Check booking status as 'Pending'
                                1, 0 // Count if 'Pending', else 0
                            ]
                        }
                    },
                    // total_stays_listing: {
                    //     $sum: {
                    //         $cond: [
                    //             { $eq: ['$type', 'Hotel'] }, // Check if the type is 'Hotel'
                    //             1, 0
                    //         ]
                    //     }
                    // },
                    // total_cars_listing: {
                    //     $sum: {
                    //         $cond: [
                    //             { $eq: ['$type', 'Car'] }, // Check if the type is 'Car'
                    //             1, 0
                    //         ]
                    //     }
                    // },
                    in_progress_bookings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking_status', 'In Progress'] }, // Check if status is 'In Progress'
                                1, 0
                            ]
                        }
                    },
                    total_completed_bookings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking_status', 'Completed'] }, // Check if booking status is 'Completed'
                                1, 0 // Count if 'Completed', else 0
                            ]
                        }
                    },
                }
            },
            {
                $project: {
                    total_sales: 1,
                    pending_payments: 1,
                    pending_payments_count: 1,
                    // total_stays_listing: 1,
                    // total_cars_listing: 1,
                    in_progress_bookings: 1,
                    total_completed_bookings: 1, // Include completed bookings count
                    _id: 0
                }
            }
        ]);

        const total_stays_listing = await this.hotelAndCarService.getHotelsCount(user?.company_id || null)

        const total_cars_listing = await this.hotelAndCarService.getCarsCount(user?.company_id || null)

        const totalData = result[0] || {}; // If no data, default to empty object

        const adCards = await this.userService.getHostAndPendingApprovals()

        const total_earnings = await this.getTotalEarnings(user, companyFilter)

        const data = {
            common_cards: {
                total_completed_bookings: totalData.total_completed_bookings || 0,
                total_sales: totalData.total_sales || 0,
                pending_payment: totalData.pending_payments || 0,
                total_stays_listing: total_stays_listing || 0,
                total_cars_listing: total_cars_listing || 0,
                in_progress_bookings: totalData.in_progress_bookings || 0,
                pending_payments_count: totalData.pending_payments_count || 0,
                total_earnings: total_earnings?.common_cards?.total_earnings || 0,
            },
            admin_cards: {
                pending_queries: adCards.pending_queries, // Placeholder for pending queries
                pending_host_requests: adCards.pending_hosts, // Placeholder for pending host requests
                pending_approvals: adCards.pending_queries, // Placeholder for pending approvals
            },

        };

        return data;
    }



    async getTotalEarnings(user, companyFilter) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed in JavaScript Date

        // Generate an array of the last 12 months in reverse order (from last month to current month)
        const last12Months = Array.from({ length: 12 }, (_, index) => {
            const month = (currentMonth - index - 1 + 12) % 12; // Ensure month wraps around correctly
            const year = month >= currentMonth ? currentYear - 1 : currentYear; // Handle year change

            return { month, year };
        });



        const result = await this.bookingModel.aggregate([
            // Match completed bookings from the last 12 months
            {
                $match: {
                    status: BookingStatus.C,
                    ...companyFilter,
                    start_date: { $gte: new Date(`${currentYear}-01-01`) }
                }
            },
            {
                $project: {
                    month: { $month: '$start_date' },
                    year: { $year: '$start_date' },
                    sub_total: 1
                }
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    total_earnings: { $sum: '$sub_total' }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 } // Sort by year and month in descending order
            },
            {
                $project: {
                    year: '$_id.year',
                    month: '$_id.month',
                    total_earnings: { $round: ['$total_earnings', 2] }, // Round to two decimal places
                    _id: 0
                }
            },
            {
                $addFields: {
                    monthName: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$month', 1] }, then: 'January' },
                                { case: { $eq: ['$month', 2] }, then: 'February' },
                                { case: { $eq: ['$month', 3] }, then: 'March' },
                                { case: { $eq: ['$month', 4] }, then: 'April' },
                                { case: { $eq: ['$month', 5] }, then: 'May' },
                                { case: { $eq: ['$month', 6] }, then: 'June' },
                                { case: { $eq: ['$month', 7] }, then: 'July' },
                                { case: { $eq: ['$month', 8] }, then: 'August' },
                                { case: { $eq: ['$month', 9] }, then: 'September' },
                                { case: { $eq: ['$month', 10] }, then: 'October' },
                                { case: { $eq: ['$month', 11] }, then: 'November' },
                                { case: { $eq: ['$month', 12] }, then: 'December' }
                            ],
                            default: 'Unknown'
                        }
                    }
                }
            },
            {
                $project: {
                    monthName: 1,
                    total_earnings: 1
                }
            },
            {
                $group: {
                    _id: null,
                    total_earnings: { $push: { month: '$monthName', value: '$total_earnings' } }
                }
            },
            {
                $project: {
                    total_earnings: 1,
                    _id: 0
                }
            }
        ]);

        // Ensure we have 12 months of data, even if some months have no bookings
        const totalEarnings = last12Months.map(({ month, year }) => {
            const monthName = [
                'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
            ][month - 1];
            const earnings = result[0]?.total_earnings.find((item) => item.month === monthName);
            return {
                month: monthName,
                value: earnings ? earnings.value : 0.00 // Ensure zero earnings are shown as 0.00
            };
        });

        const data = {
            common_cards: {
                total_completed_bookings: 100, // Replace with your logic
                total_sales: 100, // Replace with your logic
                pending_payment: 100, // Replace with your logic
                total_stays_listing: 100, // Replace with your logic
                total_earnings: totalEarnings,
                total_cars_listing: 100, // Replace with your logic
                in_progress_bookings: 100, // Replace with your logic
            },
            admin_cards: {
                pending_queries: 100, // Replace with actual logic
                pending_host_requests: 100, // Replace with actual logic
                pending_approvals: 100, // Replace with actual logic
            },
        };

        return data;
    }



    async getPaginatedUsers(rpp: number, page: number, filter: Object, orderBy, user) {

        filter = matchFilters(filter);


        if (user?.company_id) {
            filter['company_id'] = user?.company_id
        }

        if (!filter['status']) {
            filter['status'] = { $ne: BookingStatus.CR }
        }


        const skip: number = (page - 1) * rpp;
        const totalDocuments: number = await this.bookingModel.countDocuments(filter);
        const totalPages: number = Math.ceil(totalDocuments / rpp);
        page = page > totalPages ? totalPages : page;

        console.log('filter-------', filter['$and'])
        console.log('filter-------', filter)

        const bookings = await this.bookingModel
            .find(filter, {
                _id: 1, status: 1, company_payment: 1, booking_status: 1, nights: 1, sub_total: 1, reference_number: 1, check_in_time: 1, check_out_time: 1, start_date: 1, hotel_details: 1, car_details: 1, end_date: 1, type: 1, created_at: 1, company_payment_paid_on: 1,
                company_payment_amount: 1,
                company_payment_comment: 1,

            })
            .sort(orderBy)
            .skip(skip)
            .limit(rpp)
            .populate({ path: 'company_id', select: '_id title description icon' })



        // const bookings = await this.bookingModel.aggregate([
        //     {
        //         $match: { ...filter }
        //     },
        //     // {
        //     //     $skip: skip
        //     // },
        //     // {
        //     //     $limit: rpp
        //     // },
        //     // {
        //     //     $lookup: {
        //     //         from: 'companies',
        //     //         localField: 'company_id',
        //     //         foreignField: '_id',
        //     //         as: 'company',
        //     //         pipeline: [
        //     //             { $project: { _id: 1, title: 1, description: 1 } } // Select specific fields in fuel type
        //     //         ]
        //     //     },
        //     // },
        //     // { $unwind: '$company' },
        //     // {
        //     //     $project: {
        //     //         _id: 1,
        //     //         status: 1,
        //     //         company_payment: 1,
        //     //         nights: 1,
        //     //         sub_total: 1,
        //     //         reference_number: 1,
        //     //         check_in_time: 1,
        //     //         check_out_time: 1,
        //     //         start_date: 1,
        //     //         hotel_details: 1,
        //     //         car_details: 1,
        //     //         end_date: 1,
        //     //         type: 1,
        //     //         created_at: 1,
        //     //         company_id: '$company',
        //     //         company_name: 1


        //     //     }
        //     // }
        // ]);

        console.log('bookings find-------', (await this.bookingModel.find(filter)).length)
        console.log('bookings length-------', bookings.length)


        return { pages: `Page ${page} of ${totalPages}`, current_page: page, total_pages: totalPages, total_records: totalDocuments, data: bookings };

    }

    /**
     *The purpose of this method is to return bandCategory based on filter
     * @param $filter filter query as an argument
     * @param $orderBy orderby as an argument
     * @returns bandCategory based on filter
     */
    async getFilteredUsers($filter: Object, $orderBy, user) {



        if (!$filter['status']) {
            $filter['status'] = { $ne: BookingStatus.CR }
        }


        if (user?.company_id) {
            $filter['company_id'] = user?.company_id
        }


        return await this.bookingModel
            .find($filter, {
                _id: 1, status: 1, company_payment: 1, booking_status: 1, nights: 1, sub_total: 1, reference_number: 1, check_in_time: 1, check_out_time: 1, start_date: 1, hotel_details: 1, car_details: 1, end_date: 1, type: 1, created_at: 1, company_payment_paid_on: 1,
                company_payment_amount: 1,
                company_payment_comment: 1,
            })
            .sort($orderBy)
            .populate({ path: 'company_id', select: '_id title description icon' })

    }

    async getBookingsForUser(user: { userId?: ObjectId }) {
        const userExists = await this.userService.getUserById(user.userId);
        const currentDate = new Date();

        const hotels = await this.bookingModel.aggregate([
            {
                $match: { created_by: userExists._id, type: BookingType.H, status: { $ne: BookingStatus.CR } }
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
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company',
                },
            },
            { $unwind: '$company' },
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
                    company: 1,
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
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company',
                },
            },
            { $unwind: '$company' },
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
                    company: 1,
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

    async getBookingDetail(id, user: { userId?: ObjectId }) {

        const bookingExists = await this.bookingModel.findOne({ _id: id, is_deleted: false })

        if (!bookingExists) {
            throw new BadRequestException('Invalid Booking id')
        }
        const currentDate = new Date();

        const hotels = await this.bookingModel.aggregate([
            {
                $match: { _id: bookingExists._id, status: { $ne: BookingStatus.CR } }
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
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company',
                },
            },
            { $unwind: '$company' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'created_by',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
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
                    company: 1,
                    taxes_and_fees: 1,
                    reference_number: 1,
                    check_in_time: 1,
                    check_out_time: 1,
                    nights: 1,
                    hotel_details: 1,
                    car_details: 1,
                    type: 1,
                    user: 1,
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


        return hotels[0];
    }


    async updateBooking(body: IPayment, booking_id) {

        return await this.bookingModel.findByIdAndUpdate({ _id: booking_id }, { payment: body, company_payment_amount: body?.amount, status: BookingStatus.C })

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

        return await this.bookingModel.findByIdAndUpdate({ _id: bookingExists._id }, { status: BookingStatus.C, checked_out: true }, { new: true })

    }

    async updateBookingCompanyStatus(id, body: UpdateCompanyPaymentDto, user: { userId?: ObjectId }) {

        const bookingExists = await this.bookingModel.findOne({ _id: id, is_deleted: false })

        if (!bookingExists) {
            throw new BadRequestException('Invalid id')
        }

        const updatedBooking = await this.bookingModel.findByIdAndUpdate(
            { _id: bookingExists._id },
            {
                status: body.client_payment_status,
                company_payment: body.company_payment,
                updated_by: user.userId,
                booking_status: body.booking_status,
                company_payment_amount: body.company_payment_amount,
                company_payment_comment: body.company_payment_comment,
                company_payment_paid_on: body.company_payment_paid_on,
            },
            { new: true })


        return updatedBooking;


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

        const hotelExists = await this.hotelAndCarService.getHotelOrCarById(hotel_or_car);

        if (!hotelExists) {
            throw new BadRequestException('Invalid hotel Id');
        }

        if (adults && adults === 0) {
            throw new BadRequestException('There should be at least 1 adult');
        }

        // // Check if availability_from has been reached
        // const today = new Date();
        // if (hotelExists.availability_from && new Date(hotelExists.availability_from) > today) {
        //     throw new BadRequestException(
        //         `Booking is not allowed before ${hotelExists.availability_from}`
        //     );
        // }

        // // Check if availability_till has passed
        // if (hotelExists.availability_till && new Date(hotelExists.availability_till) < today) {
        //     throw new BadRequestException(
        //         `Booking is not allowed after ${hotelExists.availability_till}`
        //     );
        // }

        const reference_number = Array.from(
            { length: 15 },
            () =>
                'abcdefghijk123455678990lmnopqr0928340483stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
                Math.floor(Math.random() * 62)
                ]
        ).join('').toLowerCase();

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

        let sub_total = hotelExists?.price * diffInDays;

        const tax = sub_total * 0.17;

        sub_total = sub_total + tax;

        const company = await this.companiesService.getCompanyById(hotelExists.company_id);

        let booking = await new this.bookingModel({
            hotel_or_car,
            start_date,
            end_date,
            type: hotelExists?.type,
            company_id: hotelExists.company_id,
            company_name: company?.title,
            reference_number: reference_number,
            guests: {
                adults: adults,
                children: children,
                infants: infants,
            },
            taxes_and_fees: {
                tax_percentage: 17,
                total_tax_applied: tax,
            },
            sub_total: sub_total,
            check_in_time: hotelExists.check_in_time,
            check_out_time: hotelExists.check_out_time,
            nights: diffInDays,
            created_by: user.userId ? user.userId : null,
        }).save();

        booking['rating'] = 4.3;

        return booking;
    }


    async insertBookingPayment(booking_id, body: CreateCompanyPaymentDto, user: { userId?: ObjectId }) {

        const bookingExists = await this.bookingModel.findOne({ _id: booking_id })

        if (!bookingExists) {
            throw new BadRequestException('Invalid booking id')
        }

        const {
            company_payment,
            company_payment_amount,
            company_payment_comment,
            booking_status
        } = body;

        if (company_payment_amount > bookingExists.sub_total) {
            throw new BadRequestException('Value cannot be greater than the Booking subtotal')
        }

        const bookingUpdated = await this.bookingModel.findByIdAndUpdate({ _id: bookingExists._id }, {
            company_payment_paid_on: new Date(),
            company_payment_amount,
            company_payment_comment,
            booking_status,
            company_payment,
            updated_by: user.userId
        })
        return bookingUpdated

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
