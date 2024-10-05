import mongoose, { Document, Schema, model, Model } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  age: number;
  address: string;
  phone: string;
  role: "admin" | "doctor" | "patient";
  patients: mongoose.Types.ObjectId[];
  doctor: mongoose.Types.ObjectId;
  access_token: string;
  refresh_token: string;
  addPatient(patientId: mongoose.Types.ObjectId): Promise<void>;
  addDoctor(doctorId: mongoose.Types.ObjectId): Promise<void>;
  removePatient(patientId: mongoose.Types.ObjectId): Promise<void>;
  removeDoctor(doctorId: mongoose.Types.ObjectId): Promise<void>;
}
const userSchema = new Schema<IUser>(
  {
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    name: { type: String, require: true },
    age: { type: Number, require: true },
    address: { type: String, require: true },
    phone: { type: String, require: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: true,
    },
    patients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    doctor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    access_token: { type: String, require: true },
    refresh_token: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);
userSchema.methods.addPatient = async function (patientId: mongoose.Types.ObjectId) {
  if (this.role === 'doctor') {
    if (this.patients.includes(patientId)) {
      throw new Error('Patient is already added to this doctor');
    }
    this.patients.push(patientId);
    await this.save();
  } else {
    throw new Error('Only doctors can add patients');
  }
};

userSchema.methods.addDoctor = async function (doctorId: mongoose.Types.ObjectId) {
  if (this.role === 'patient') {
    if (this.doctor.includes(doctorId)) {
      throw new Error('Doctor is already added to this patient');
    }
    this.doctor.push(doctorId);
    await this.save();
  } else {
    throw new Error('Only patients can add doctors');
  }
};

userSchema.methods.removePatient = async function (patientId: mongoose.Types.ObjectId) {
  this.patients = this.patients.filter((p: mongoose.Types.ObjectId) => !p.equals(patientId));
  await this.save();
};

userSchema.methods.removeDoctor = async function (doctorId: mongoose.Types.ObjectId) {
  this.doctor = this.doctor.filter((d: mongoose.Types.ObjectId) => !d.equals(doctorId));
  await this.save();
};

const User: Model<IUser> = model<IUser>("User", userSchema);
export default User;
