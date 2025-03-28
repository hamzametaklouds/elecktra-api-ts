import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {

    private s3: AWS.S3;

    constructor(private configService:ConfigService) {
        AWS.config.update({
            accessKeyId:  process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION
          });
        this.s3 = new AWS.S3();
    }



    async uploadFile(file: any, fileName: string) {
        const bucketName = process.env.S3_BUCKET_NAME;
        const uniqueFileName=`${uuidv4()}.${fileName.split('.').pop()}`;
        const params = {
          Bucket: bucketName,
          Key: uniqueFileName,
          Body: file,
        };
        try{
          const result=await this.s3.upload(params).promise();

          
         return result.Location;

        }
        catch(err)
        {
          console.log(err)

        }
         

      }


}
