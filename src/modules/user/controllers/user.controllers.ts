
import { Request, Response } from "express";
import {UserModel} from "@modules/user/models/user.model"; 
import { File, UploadedFile } from "@modules/user/models/file";
import * as responses from "@utils/formaters/responses";
import { HttpStatus } from "@utils/constants/httpStatus"; 
import { s3Config } from "@utils/s3/s3config";

import { DynamoDB, S3 } from "aws-sdk";
import * as uuid from "uuid";
import { EmailTemplate, sendEmail } from "@utils/email/email.helper";
import "source-map-support/register";

const dynamoDB = new DynamoDB.DocumentClient();
const s3 = new S3();


export async function createUser(req:Request, res:Response){

    const { user_first_name, user_last_name, user_email, user_password, user_file } = req.body;
    try {
        const params = {
          TableName: process.env.DYNAMO_TABLE,
          Item: {
            id: uuid.v1(),
            user_first_name,
            user_last_name,
            user_email,
            user_password,
            user_file
          },
        };
        await dynamoDB.put(params).promise();
    
        const emailUserTemplate = {
            subject: `Usuário criado com sucesso`
          } as EmailTemplate;
        
          await sendEmail(user_email, emailUserTemplate, res);
          
        return {
          statusCode: 200,
          body: JSON.stringify(params.Item),
        };
      } catch (err) {
        console.error(err);
        return responses.sendError(
            res,404,
            "Impossível criar usuário",
            HttpStatus.BAD_REQUEST
          );
      }


}

export async function uploadFile(req:Request, res:Response){ 
       
     if(req.files){
        const file= req.files.media  
        const fileName = `${new Date().getTime()}_${req.files.file}`;

        const mimetype = file.mimetype;
        const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.data,
        ContentType: mimetype,
        ACL: 'public-read'
        };
        const res = await new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => err == null ? resolve(data) : reject(err));
          });
        return {fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}` };
            
        
     }
      

}

 