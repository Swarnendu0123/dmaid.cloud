import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectToDB } from "./db";
import v2router from "./api/v2";
const cors = require("cors");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

connectToDB();

// middlewares
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root route
app.get("/", (req: Request, res: Response) => {
  //   redirect to /api/v1
  res.redirect("/api/v1");
});

app.use("/api/v2", v2router);

// Error handling middleware (must be last)
// app.use(errorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
