import Express from "express"; 
import upload from "express-fileupload";
const port = 3000; 
const host = '0.0.0.0'

 const app = Express();
 app.use(upload());

 app.listen(port,host,()=>{
    console.log("Inicializando o servidor ");
    console.log(`Servidor: ${host}:${port}`);
});