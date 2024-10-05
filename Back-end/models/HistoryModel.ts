import mongoose, { Document, Schema } from "mongoose";

interface IHistory extends Document {
  patient_name: string;
  doctor_name: string;
  test_name?: string;
  difficult?: string
  date: Date;
  note?: string;
  score?: number
}

const historySchema: Schema = new Schema({
  patient_name: {
    type: String,
    required: true,
  },
  doctor_name: {
    type: String,
    required: true,
  },
  test_name: {
    type: String,
  },
  difficult: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  score: {
    type: String,
  },
  note: {
    type: String,
  },
});

const History = mongoose.model<IHistory>("History", historySchema);

export default History;
