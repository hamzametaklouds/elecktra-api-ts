import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { ITool } from './tools.schema';
import { TOOLS_PROVIDER_TOKEN } from './tools.constants';
import { CreateToolDto } from './dtos/create-tool.dto';
import { UpdateToolDto } from './dtos/update-tool.dto';

@Injectable()
export class ToolsService {
  constructor(
    @Inject(TOOLS_PROVIDER_TOKEN)
    private toolModel: Model<ITool>,
  ) {}

  async create(createToolDto: CreateToolDto) {
    // Check if tool with same key already exists
    const existingTool = await this.toolModel.findOne({
      key: createToolDto.key.toLowerCase().trim(),
      is_deleted: false
    });

    if (existingTool) {
      throw new BadRequestException(`Tool with key '${createToolDto.key}' already exists`);
    }

    const tool = new this.toolModel({
      ...createToolDto,
      key: createToolDto.key.toLowerCase().trim()
    });
    return await tool.save();
  }

  async getPaginatedTools(rpp: number, page: number, filter: Object, orderBy) {
    filter['is_deleted'] = false;

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.toolModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const tools = await this.toolModel
      .find(filter)
      .sort(orderBy)
      .skip(skip)
      .limit(rpp);

    return { 
      pages: `Page ${page} of ${totalPages}`, 
      current_page: page, 
      total_pages: totalPages, 
      total_records: totalDocuments, 
      data: tools 
    };
  }

  async getFilteredTools(filter: Object, orderBy) {
    filter['is_deleted'] = false;

    return await this.toolModel
      .find(filter)
      .sort(orderBy);
  }

  async findOne(id: string) {
    const tool = await this.toolModel.findOne({ _id: id, is_deleted: false });
    if (!tool) {
      throw new NotFoundException('Tool not found');
    }
    return tool;
  }

  async findByKey(key: string) {
    return await this.toolModel.findOne({ 
      key: key.toLowerCase().trim(), 
      is_deleted: false 
    });
  }

  async findByIds(ids: string[]): Promise<ITool[]> {
    return await this.toolModel.find({
      _id: { $in: ids },
      is_deleted: false,
      enabled: true
    });
  }

  async validateTools(toolIds: string[]): Promise<boolean> {
    const tools = await this.findByIds(toolIds);
    return tools.length === toolIds.length;
  }

  async update(id: string, updateToolDto: UpdateToolDto) {
    const tool = await this.toolModel.findOne({ 
      _id: id, 
      is_deleted: false 
    });
    
    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    // If updating key, check for duplicates
    if (updateToolDto.key && updateToolDto.key !== tool.key) {
      const existingTool = await this.toolModel.findOne({
        key: updateToolDto.key.toLowerCase().trim(),
        is_deleted: false,
        _id: { $ne: id }
      });

      if (existingTool) {
        throw new BadRequestException(`Tool with key '${updateToolDto.key}' already exists`);
      }
    }

    const updateData = { ...updateToolDto };
    if (updateData.key) {
      updateData.key = updateData.key.toLowerCase().trim();
    }

    return await this.toolModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async remove(id: string) {
    const tool = await this.toolModel.findOne({ _id: id, is_deleted: false });
    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    return await this.toolModel.findByIdAndUpdate(
      id,
      { is_deleted: true },
      { new: true }
    );
  }

  async seedBaseTools() {
    const baseTools = [
      {
        key: 'gmail',
        title: 'Gmail',
        description: 'Google\'s email service for sending and receiving emails',
        category: 'email',
        icon_url: 'https://developers.google.com/gmail/images/gmail-icon.png',
        oauth_type: 'oauth2',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send']
      },
      {
        key: 'notion',
        title: 'Notion',
        description: 'All-in-one workspace for notes, docs, and collaboration',
        category: 'docs',
        icon_url: 'https://www.notion.so/images/logo-ios.png',
        oauth_type: 'oauth2',
        scopes: ['read', 'write']
      },
      {
        key: 'gdrive',
        title: 'Google Drive',
        description: 'Google\'s cloud storage service for files and documents',
        category: 'storage',
        icon_url: 'https://developers.google.com/drive/images/drive_icon.png',
        oauth_type: 'oauth2',
        scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file']
      },
      {
        key: 'gsheets',
        title: 'Google Sheets',
        description: 'Google\'s spreadsheet application for data management',
        category: 'spreadsheets',
        icon_url: 'https://developers.google.com/sheets/images/sheets_icon.png',
        oauth_type: 'oauth2',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/spreadsheets']
      },
      {
        key: 'dropbox',
        title: 'Dropbox',
        description: 'Cloud storage service for file synchronization and sharing',
        category: 'storage',
        icon_url: 'https://cfl.dropboxstatic.com/static/images/logo_catalog/dropbox_logo_glyph_blue_m1@2x.png',
        oauth_type: 'oauth2',
        scopes: ['files.content.read', 'files.content.write']
      }
    ];

    for (const toolData of baseTools) {
      const existingTool = await this.toolModel.findOne({ 
        key: toolData.key, 
        is_deleted: false 
      });
      
      if (!existingTool) {
        await new this.toolModel(toolData).save();
        console.log(`Seeded tool: ${toolData.title}`);
      }
    }
  }
}