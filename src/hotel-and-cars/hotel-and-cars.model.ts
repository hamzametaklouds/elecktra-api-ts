import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { HOTEL_AND_CARS_COLLECTION, HOTEL_AND_CARS_PROVIDER_TOKEN } from './hotel-and-cars.constants';
import { HotelAndCarSchema } from './hotel-and-cars.schema';

export const HotelAndCarModel = [
    {
        provide: HOTEL_AND_CARS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(HOTEL_AND_CARS_COLLECTION, HotelAndCarSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
