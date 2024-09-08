import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { IDestinations } from './destinations.schema';
import { DESTINATIONS_PROVIDER_TOKEN } from './destinations.constants';
import { CreateDestinationDto } from './dtos/create-destination.dto';

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
                lat,
                long,
                is_popular,
                images,
                created_by: user.userId ? user.userId : null
            }).save();


        return screen

    }

    async destinations() {


        const hotels = [
            {
                _id: '66d7270321521b8b510c9ef1',
                title: 'London',
                description: 'xyz',
                images: [
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                lat: 36.98,
                long: 38.76,


            },
            {
                _id: '66d7270321521b8b510c9ef2ß',
                title: 'New York',
                description: 'xyz',
                images: [
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                lat: 36.98,
                long: 38.76,

            },
            {
                _id: '66d7270321521b8b510c9ef3',
                title: 'Hotel 2 in central chicago',
                description: 'xyz',
                images: [
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                lat: 36.98,
                long: 38.76,

            },
            {
                _id: '66d7270321521b8b510c9ef4',
                title: 'studio apartment in central Alabama',
                description: 'xyz',
                images: [
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=dwZ6FKYAgxspCM&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=V5_AAvGMs_PU4M&vssid=mosaic',
                    'https://www.google.com/search?sca_esv=a83123858829115d&rlz=1C5CHFA_enPK1043PK1045&sxsrf=ADLYWIJ5qIq-j2td5cgsNW_jooO32aErjQ:1725800050055&q=hotel+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2joQcoZ-0Q2Udkt2zEybT7HdNV1kobqvEwEVRYBCltlBtQd5-pPeakpVgpgEn2RgmgzeZo15rltNMrDtoZe63sl46hHJXZmfPBeZdqdwrtlSxkvce3I&sa=X&sqi=2&ved=2ahUKEwiMib-XsrOIAxUYcPEDHWFXNNAQtKgLegQIFxAB&biw=1440&bih=731&dpr=2#vhid=DiWjt0ne9sITjM&vssid=mosaic'
                ],
                lat: 36.98,
                long: 38.76,

            }

        ]

        return hotels

    }

}
