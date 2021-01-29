import { APIGatewayProxyHandler } from "aws-lambda";
import { Response} from "express";
import { DynamoDB, S3 } from "aws-sdk";
import * as uuid from "uuid";
import { EmailTemplate, sendEmail } from "./email.helper";
import "source-map-support/register";

type requestParams = {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPassword: string; 
  userFile:string;
};

const dynamoDB = new DynamoDB.DocumentClient();
const s3 = new S3();

const getErrorResponse = (errorMessage: string) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: errorMessage,
    }),
  };
};

const uploadFileToS3 = async (userFile) => {
  if (!userFile) {
    return;
  }
  try { 
     
     
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: userFile,  
      ContentType: `application/pdf`
    }
    try {
      await s3.upload(params).promise()
      return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${userFile}`;
    } catch(err) {
      console.error(err);
      return;
    }

  } catch (err) {
    console.error(err);
    return;
  }
};

 

export const createUser: APIGatewayProxyHandler = async (event, _context,res:Response) => {
  const requestBody: requestParams = JSON.parse(event.body);
  const { userFirstName, userLastName,userEmail, userPassword,userFile } = requestBody;
  

  const brewImagePath = await uploadFileToS3(userFile);

  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE,
      Item: {
        id: uuid.v1(),
        userFirstName,
        userLastName,
        userEmail,
        userPassword,
        brewImage: brewImagePath 
      },
    };
    await dynamoDB.put(params).promise();

    const emailUserTemplate = {
        subject: `Usuário criado com sucesso`
      } as EmailTemplate;
    
      await sendEmail("fernandomuto22@gmail.com", emailUserTemplate, res);
      
    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (err) {
    console.error(err);
    return getErrorResponse(err);
  }
};
