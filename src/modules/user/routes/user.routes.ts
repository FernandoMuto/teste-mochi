import {Application} from "express";
import * as user from "@modules/user/controllers/user.controllers";

export default (app: Application)=>{
    app.
       route("/api/testemochi/createuser").
        post(user.createUser);

    app.
      route("/api/testemochi/uploadfile").
        post(user.uploadFile);

}