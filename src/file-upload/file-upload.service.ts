import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {

    private s3: AWS.S3;

    constructor(private configService:ConfigService) {
        AWS.config.update({
            accessKeyId: this.configService.get('s3AccessKeyId.s3AccessKeyId'),
            secretAccessKey: this.configService.get('s3SecretAccessKey.s3SecretAccessKey'),
            region: this.configService.get('s3Region.s3Region')
            //keys
          });
        this.s3 = new AWS.S3();
    }


    async uploadFile(file: any, fileName: string) {
        const bucketName = this.configService.get('s3BucketName.s3BucketName');
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
