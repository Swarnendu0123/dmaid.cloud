import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectToDB } from "./db";
import v1router from "./api/v1";
import userRoutes from "./api/users";
import cookieParser from 'cookie-parser';
import { authenticateUser } from "./middleware/middleware";
import diagramRouter from "./api/diagram"
const cors = require("cors");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

connectToDB();

// middlewares

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true,     
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// root route

app.get("/", (req: Request, res: Response) => {
  //   redirect to /api/v1
  res.redirect("/api/v1");
});

app.use("/api/v1", authenticateUser,v1router);
app.use("/api/diagrams",authenticateUser,diagramRouter)
app.use('/api/users', userRoutes)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
