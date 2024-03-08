import express from 'express';
import router from './router/web.js';
import connectDb from './db/connectDb.js';
import bodyParser from 'body-parser';
import { config } from 'dotenv';


config();

const app = express();
const port = process.env.PORT || 4500;
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017";


app.use(bodyParser.json());


connectDb(DATABASE_URL);


app.use('/', router);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
