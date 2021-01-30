 
import { Request, Response } from "express";
import nodemailer from "nodemailer"; 
import sgTransport from "nodemailer-sendgrid-transport"; 
const ejs = require("ejs"); 

const options = {
  auth: {
    // api_user: config.mailer.options.auth.user,
    api_key: "*********"
  }
};

const smtpTransport = nodemailer.createTransport(sgTransport(options));

export interface EmailTemplate {
  subject: string;
  templatePath: string; // modules/users/templates/reset-password-email
  data: any; // hash {}
}

export function sendEmail(
  to: string,
  emailTemplate: EmailTemplate,
  res: Response
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const sub = emailTemplate.subject || "Mochi";
    const render = renderAsPromise(res);

    let emailHTML = "";

    try {
      emailHTML = await render(
        // `${pathReq.dirname(
        //   require!.main!.filename || process!.mainModule!.filename
        // )}/${emailTemplate.templatePath}.html`,
        `${emailTemplate.templatePath}.html`,
        emailTemplate.data
      );
    } catch (err) {
      console.log(err);
      return reject();
    }

    const mailOptions = {
      to: to,
      from: "fernandomuto22@gmail.com",
      subject: sub,
      html: emailHTML
    };

    try {
      await smtpTransport.sendMail(mailOptions);
      console.log("Email succeful sent");
      return resolve(true);
    } catch (err) {
      console.log(err);
      return reject();
    }
  });
}

export async function getEmailTemplate(): Promise<string> {
  return new Promise(resolve => {});
}

export const renderAsPromise = (res: Response) => (
  path: string,
  data_var: any
) => {
  return new Promise<string>((resolve, reject) => {
    ejs.renderFile(path, data_var, function(err: any, data: any) {
      if (err) {
        reject(err);
      }
      resolve(data);
    }); 
  });
};
