import { Controller, Post, UseInterceptors, UploadedFile, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiTags, ApiBody, ApiBearerAuth, } from '@nestjs/swagger';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FileUploadService } from './file-upload.service';

@Controller('file-upload')
@ApiTags('file-upload')
export class FileUploadController {
    constructor(private fileUploadService:FileUploadService){}
    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard)
    @Post()
    @ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      })
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    async uploadFile(@UploadedFile() file) {
      try {
        const fileName = file.originalname;
        const data =await this.fileUploadService.uploadFile(file.buffer, fileName);
        return { status: data?true:false,statusCode:data?201:400, message: data?'File uploaded successfully':'Bad Request',data:data?data:null };
      } catch (error) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    
}
