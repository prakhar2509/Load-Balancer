import express from 'express';
import cors from 'cors';


const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userConfigRoutes from './routes/userConfig.routes.js';

import { handleRequest } from './controllers/gateway.controller.js';

app.use('/config', userConfigRoutes);
app.use('/', handleRequest);

export { app };