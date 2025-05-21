import { IUser } from "../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
