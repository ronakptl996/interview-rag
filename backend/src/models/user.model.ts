import { Document, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface IUser extends Document {
  email: string;
  password: string;
  isPasswordCorrect: (password: string) => boolean;
  generateToken: () => string;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = async function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET_TOKEN!,
    { expiresIn: "1d" }
  );
};

const User = model<IUser>("User", userSchema);

export default User;
