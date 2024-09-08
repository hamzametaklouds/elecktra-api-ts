import { Connection } from 'mongoose';
import { CONNECTION_PROVIDER } from 'src/database/database.constants';
import { BOOKINGS_COLLECTION, BOOKINGS_PROVIDER_TOKEN } from './bookings.constants';
import { BookingSchema } from './bookings.schema';

export const BookingModel = [
    {
        provide: BOOKINGS_PROVIDER_TOKEN,
        useFactory: async (connection: Connection) => connection.model(BOOKINGS_COLLECTION, BookingSchema),
        inject: [CONNECTION_PROVIDER],
    },
];
