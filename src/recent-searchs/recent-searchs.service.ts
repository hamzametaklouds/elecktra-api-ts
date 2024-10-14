import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { RECENT_SEARCHS_PROVIDER_TOKEN } from './recent-searchs.constants';
import { IRecentSearchs, OptionParentType } from './recent-searchs.schema';

@Injectable()
export class RecentSearchsService {

    constructor(
        @Inject(RECENT_SEARCHS_PROVIDER_TOKEN)
        private recentSearchModel: Model<IRecentSearchs>
    ) { }


    async insertSearch(body: {
        title: string,
        address: string,
        adults: number,
        children: number,
        infants: number,
        start_date: string,
        end_date: string,
        type: string,
        lat: number,
        long: number,
    }, user: { userId?: ObjectId }) {

        const {
            title,
            address,
            adults,
            children,
            infants,
            start_date,
            end_date,
            type
        } = body;

        const screen = await new this.recentSearchModel(
            {
                title: title,
                address,
                adults,
                children,
                infants,
                start_date,
                end_date,
                type: type,
                created_by: user?.userId || null
            }).save();


        return screen

    }

    async getHotelRecentSearchs() {
        return await this.recentSearchModel.find({ type: OptionParentType.S, is_deleted: false }).sort({ created_at: -1 }).limit(6)
    }

    async getCarRecentSearchs() {
        return await this.recentSearchModel.find({ type: OptionParentType.C, is_deleted: false }).sort({ created_at: -1 }).limit(6)
    }



}
