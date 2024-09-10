import { Inject, Injectable } from '@nestjs/common';
import { PlanTripDto } from './dtos/book-trip.dto';
import { Model, ObjectId } from 'mongoose';
import { HOTEL_AND_CARS_PROVIDER_TOKEN } from './hotel-and-cars.constants';
import { IHotelAndCars } from './hotel-and-cars.schema';

@Injectable()
export class HotelAndCarsService {

    constructor(
        @Inject(HOTEL_AND_CARS_PROVIDER_TOKEN)
        private hotelAndCarsModel: Model<IHotelAndCars>
    ) { }



    async planTrip(body: PlanTripDto, user: { userId?: ObjectId }) {

        const {
            start_date,
            end_date,
            adults,
            children,
            infants,
            lat,
            long
        } = body;


        const hotels = [
            {
                _id: '66d7270321521b8b510c9ef1',
                title: 'Hotel 1 in times square',
                description: '3 star hotel',
                address: 'Central New York City',
                bedrooms_available: 45,
                images: [
                    'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
                ],
                highlights: [{
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Washer and Dryer'
                }],
                price: 12,
                ratings: 3.2,
                total_reviews: 321,
                lat: 36.98,
                long: 38.76,

            },
            {
                _id: '66d7270321521b8b510c9ef2ß',
                title: 'Hotel 2 in central chicago',
                description: 'Studio Apartment',
                address: 'Central Chicago City',
                bedrooms_available: 45,
                images: [
                    'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
                ],
                highlights: [{
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Washer and Dryer'
                }],
                price: 897,
                ratings: 4.5,
                total_reviews: 2321,
                lat: 36.98,
                long: 38.76,

            },
            {
                _id: '66d7270321521b8b510c9ef3',
                title: 'Hotel 2 in central chicago',
                description: '4 stars hotel',
                address: 'Central Chicago City',
                bedrooms_available: 90,
                images: [
                    'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
                ],
                highlights: [{
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Washer and Dryer'
                }],
                price: 897,
                ratings: 4.5,
                total_reviews: 2321,
                lat: 36.98,
                long: 38.76,

            },
            {
                _id: '66d7270321521b8b510c9ef4',
                title: 'studio apartment in central Alabama',
                description: 'Studio Apartment',
                address: 'Central Chicago City',
                bedrooms_available: 8,
                images: [
                    'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
                    'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
                ],
                highlights: [{
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Washer and Dryer'
                }],
                price: 150,
                ratings: 4,
                total_reviews: 123,
                lat: 36.98,
                long: 38.76,

            }

        ]

        return hotels

    }

    async hotelDetail(hotel_id: string, user: { userId?: ObjectId }) {



        const hotels = {
            title: 'Hotel 1 in times square',
            description: '3 star hotel',
            address: 'Central New York City',
            bedrooms_available: 45,
            images: [
                'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png',
                'https://s3.amazonaws.com/staging.carnivalist-images/11a7dbd9-3c5c-4316-8671-ffb2d26f1c4b.png',
                'https://s3.amazonaws.com/staging.carnivalist-images/c588e25b-c20a-472a-af9f-6ae9335933d2.png'
            ],
            highlights: [{
                icon: 'https://s3.amazonaws.com/staging.carnivalist-images/dced58d8-b9fb-48d2-8847-2aac82618817.png',
                detail: 'Hot tub'
            },
            {
                icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                detail: 'Washer and Dryer'
            }],
            price: 12,
            ratings: 3.2,
            total_reviews: 321,
            lat: 36.98,
            long: 38.76,
            amenities: [
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Wifi'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Kitchen'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Refrigerator'
                },
                {
                    icon: 'https://s3.amazonaws.com/staging.carnivalist-images/581496a5-ec3f-4e0b-afd2-1fe5018f7385.png',
                    detail: 'Dryer'
                }
            ],
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
            availablity_from: '',
            availablity_till: '',
            cancellation_policy: 'jnfskj jk ttkje kjkj kjs fkjs kjf skj fkj sfkjfs dfkjd skjs skj skjs kj ',
            host_details: {
                name: 'Hamza Sohail',
                years_of_experience: 7,

            }

        }


        return hotels

    }
}
