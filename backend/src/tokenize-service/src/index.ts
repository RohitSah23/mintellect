import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import tokenizeRoutes from './routes/tokenize.routes';
import cors from 'cors';
dotenv.config();
const app = express();
app.use(express.json());
app.set('trust proxy', true);
//app.use(cors());
const PORT = process.env.TOKENIZE_PORT!;
const MONGO_URI = process.env.MONGO_URI!;
const DB_NAME = process.env.DB_NAME!;

MongoClient.connect(MONGO_URI)
    .then(client => {
        const db = client.db(DB_NAME);
        app.locals.db = db;


        app.use('/', tokenizeRoutes);

        app.listen(PORT, () => {
            console.log(`🔐 Auth service running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ DB connection error:', err);
    });
