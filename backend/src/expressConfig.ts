import express from "express";
import cors from "cors";
import routes from "./routes";

const configExpress = async (app: express.Application) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", routes);
};

export default configExpress;
