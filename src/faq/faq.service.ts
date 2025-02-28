import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { FAQ_PROVIDER_TOKEN } from './faq.constants';
import { IFAQ, ValidForType } from './faq.schema';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FAQService {
    constructor(
        @Inject(FAQ_PROVIDER_TOKEN)
        private faqModel: Model<IFAQ>
    ) { }

    async create(createFaqDto: CreateFaqDto, user: { userId?: ObjectId }) {
        const faq = await new this.faqModel({
            ...createFaqDto,
            created_by: user?.userId || null
        }).save();

        return faq;
    }

    async update(id: string, updateFaqDto: UpdateFaqDto, user: { userId?: ObjectId }) {
        const faq = await this.faqModel.findByIdAndUpdate(
            id,
            {
                ...updateFaqDto,
                updated_by: user?.userId || null
            },
            { new: true }
        );

        if (!faq) {
            throw new NotFoundException('FAQ not found');
        }

        return faq;
    }

    async getAll(validFor?: ValidForType) {
        const query: any = { is_deleted: false };
        if (validFor) {
            query.valid_for = { $in: [validFor] };
        }
        return await this.faqModel.find(query).sort({ order: 1, created_at: -1 });
    }

    async getById(id: string) {
        const faq = await this.faqModel.findOne({ _id: id, is_deleted: false });
        if (!faq) {
            throw new NotFoundException('FAQ not found');
        }
        return faq;
    }
}