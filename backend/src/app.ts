import dotenv from "dotenv";
import express from "express";
import configExpress from "./expressConfig";
import connectDB from "./connections/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const main = async () => {
  await connectDB();
  await configExpress(app);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
  });
};

main();
