import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    // ---- Core identity ----
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ---- Credentials login ----
    password: {
      type: String,
      // Not required — Google-only users won't have a password
      select: false, // never returned in queries by default
    },

    // ---- Google OAuth ----
    googleId: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    // ---- Extra profile ----
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Prevent model overwrite during hot-reload in development
const User = models.User || mongoose.model("User", UserSchema);

export default User;
