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
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                highlights: [{
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=XYCryyOYTe6ZPM&vssid=mosaic',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
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
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                highlights: [{
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=XYCryyOYTe6ZPM&vssid=mosaic',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Washer and Dryer'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Jaccuzi'
                }
                ],
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
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                highlights: [{
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=XYCryyOYTe6ZPM&vssid=mosaic',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Washer and Dryer'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Jaccuzi'
                }
                ],
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
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                highlights: [{
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=XYCryyOYTe6ZPM&vssid=mosaic',
                    detail: 'Hot tub'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Washer and Dryer'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Jaccuzi'
                }
                ],
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
                'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
            ],
            highlights: [{
                icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=XYCryyOYTe6ZPM&vssid=mosaic',
                detail: 'Hot tub'
            },
            {
                icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                detail: 'Washer and Dryer'
            }],
            price: 12,
            ratings: 3.2,
            total_reviews: 321,
            lat: 36.98,
            long: 38.76,
            amenities: [
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Wifi'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Kitchen'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
                    detail: 'Refrigerator'
                },
                {
                    icon: 'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ029LDT5_1QGJXeZwK-pzqfiAOHg:1725799897271&q=icons&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&ved=2ahUKEwjH6NHOsbOIAxULUaQEHbFDM70QtKgLegQIGhAB&biw=1440&bih=731&dpr=2#vhid=LcoQ8DQhO-Qz_M&vssid=mosaic',
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
            cancellation_policy: 'jnfskj jk ttkje kjkj kjs fkjs kjf skj fkj sfkjfs dfkjd skjs skj skjs kj '

        }


        return hotels

    }
}
