import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { FAQ_PROVIDER_TOKEN } from './faq.constants';
import { IFAQ, ValidForType, FAQType } from './faq.schema';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FAQService {
    constructor(
        @Inject(FAQ_PROVIDER_TOKEN)
        private faqModel: Model<IFAQ>
    ) { }

    private validateFiles(files: string[], type: FAQType) {
        if (!files || files.length === 0) return true;

        if (type === FAQType.PDF) {
            const allPdf = files.every(file => file.toLowerCase().endsWith('.pdf'));
            if (!allPdf) {
                throw new BadRequestException('All files must be PDFs when type is PDF');
            }
        }

        if (type === FAQType.VIDEO) {
            const allVideos = files.every(file => 
                file.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|mkv)$/));
            if (!allVideos) {
                throw new BadRequestException('All files must be videos when type is VIDEO');
            }
        }

        return true;
    }

    async create(createFaqDto: CreateFaqDto, user: { userId?: ObjectId }) {
        if (createFaqDto.files) {
            this.validateFiles(createFaqDto.files.map(f => f.url), createFaqDto.type);
        }

        const faq = await new this.faqModel({
            ...createFaqDto,
            created_by: user?.userId || null
        }).save();

        return faq;
    }

    async update(id: string, updateFaqDto: UpdateFaqDto, user: { userId?: ObjectId }) {
        if (updateFaqDto.files && updateFaqDto.type) {
            this.validateFiles(updateFaqDto.files.map(f => f.url), updateFaqDto.type);
        }

        const existingFaq = await this.faqModel.findById(id);
        if (!existingFaq) {
            throw new NotFoundException('FAQ not found');
        }

        if (existingFaq.is_deleted && updateFaqDto.is_disabled === false) {
            throw new BadRequestException('Cannot enable a deleted FAQ');
        }

        const faq = await this.faqModel.findByIdAndUpdate(
            id,
            {
                ...updateFaqDto,
                updated_by: user?.userId || null,
                ...(updateFaqDto.is_deleted ? { is_disabled: true } : {})
            },
            { new: true }
        );

        return faq;
    }

    async getAll(validFor?: ValidForType) {
        const query: any = { is_deleted: false };
        if (validFor) {
            query.valid_for = { $in: [validFor, ValidForType.BOTH] };
        }
        return await this.faqModel.find(query)
            .sort({ order: 1, created_at: -1 });
    }

    async getById(id: string) {
        const faq = await this.faqModel.findOne({ 
            _id: id, 
            is_deleted: false 
        });
        
        if (!faq) {
            throw new NotFoundException('FAQ not found');
        }
        return faq;
    }
}