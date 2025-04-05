import express from "express";
import cors from "cors";
import router from "./routes/userConfig.routes.js";
import { handleRequest } from "./controllers/gateway.controller.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/config", router);
app.use("/", handleRequest); // Load balancer handles all root requests

export { app };
