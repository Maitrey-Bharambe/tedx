import mongoose, { Schema, models } from "mongoose";

const TempRegistrationSchema = new Schema(
  {
    // Optional link to logged-in user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },

    seat: {
      type: String,
      required: [true, "Seat is required"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const TempRegistration =
  models.TempRegistration ||
  mongoose.model("TempRegistration", TempRegistrationSchema);

export default TempRegistration;
