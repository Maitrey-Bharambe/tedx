import mongoose, { Schema, models } from "mongoose";

const RegistrationDetailsSchema = new Schema(
  {
    // Optional relation to user
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
      unique: true,
    },

    seat: {
      type: String,
      required: [true, "Seat is required"],
    },

    confirmedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const RegistrationDetails =
  models.RegistrationDetails ||
  mongoose.model("RegistrationDetails", RegistrationDetailsSchema);

export default RegistrationDetails;
