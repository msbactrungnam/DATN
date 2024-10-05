import mongoose, { Document } from "mongoose";
import History from '../models/HistoryModel'; // Assume you have a History model

interface IHistory extends Document {
  patient_name: string;
  doctor_name: string;
  test_name?: string;
  difficult?: string
  date: Date;
  note?: string;
  score?: number
}

export const createHistory = async (newHistory: IHistory) => {
  const { patient_name, doctor_name, test_name, difficult, date, note, score } = newHistory;
  try {
    const createdHistory = await History.create({
      patient_name, doctor_name, test_name, difficult, date, note, score
    });

    if (createdHistory) {
      return {
        status: "OK",
        message: "History created successfully",
        data: createdHistory,
      };
    } else {
      return {
        status: "ERR",
        message: "Failed to create the History",
      };
    }
  } catch (error) {
    const err = error as Error; // Cast to Error
    throw new Error(err.message || "An unknown error occurred");
  }
};

export const getHistory = async (id?: string) => {
  try {
    if (id) {
      const getHistoryById = await History.findById(new mongoose.Types.ObjectId(id));
      if (!getHistoryById) {
        return {
          status: "ERR",
          message: "History not found",
        };
      }
      return {
        status: "OK",
        message: "SUCCESS",
        data: getHistoryById,
      };
    }
  } catch (error) {
    const err = error as Error; // Cast to Error
    throw new Error(err.message || "An unknown error occurred");
  }
};

export const updateHistory = async (id: string, data: Partial<IHistory>) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: "ERROR",
        message: "Invalid History ID",
      };
    }
    const updatedHistory = await History.findByIdAndUpdate(id, data, { new: true });
    return {
      status: "OK",
      message: "History updated successfully",
      data: updatedHistory,
    };
  } catch (error) {
    const err = error as Error; // Cast to Error
    throw new Error(err.message || "An unknown error occurred");
  }
};

export const deleteHistory = async (id: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: "ERROR",
        message: "Invalid History ID",
      };
    }
    await History.findByIdAndDelete(id);
    return {
      status: "OK",
      message: "History deleted successfully",
    };
  } catch (error) {
    const err = error as Error; // Cast to Error
    throw new Error(err.message || "An unknown error occurred");
  }
};

export const getAllHistories = async () => {
  try {
    const histories = await History.find();
    return {
      status: "OK",
      message: "SUCCESS",
      data: histories,
    };
  } catch (error) {
    const err = error as Error; // Cast to Error
    throw new Error(err.message || "An unknown error occurred");
  }
};
