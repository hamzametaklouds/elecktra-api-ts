import { Module } from '@nestjs/common';
import { FAQController } from './faq.controller';
import { FAQService } from './faq.service';
import { DatabaseModule } from 'src/database/database.module';
import { FAQModel } from './faq.model';

@Module({
    imports: [DatabaseModule],
    controllers: [FAQController],
    providers: [FAQService, ...FAQModel],
    exports: [FAQService]
})
export class FAQModule { } 