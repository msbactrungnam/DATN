import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/UserModel';
import { generalAccessToken, generalRefreshToken } from './JwtService';

interface IUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'doctor' | 'patient';
  age: number;
  address: string;
  phone: string;
}

export const createUser = async (newUser: IUser) => {
  const { email, password, name, role, age, address, phone } = newUser;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser !== null) {
      return {
        status: "OK",
        message: "EMAIL IS ALREADY IN USE",
      };
    }
    const hash = bcrypt.hashSync(password, 10);
    const createdUser = await User.create({
      email,
      password: hash,
      name,
      role,
      age,
      address,
      phone,
    });
    if (createdUser) {
      return {
        status: "OK",
        message: "SUCCESS",
        data: createdUser,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const loginUser = async (userLogin: { email: string, password: string }) => {
  const { email, password } = userLogin;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser === null) {
      return {
        status: "ERR",
        message: "User is not defined",
      };
    }
    const checkPassword = bcrypt.compareSync(password, checkUser.password);
    if (!checkPassword) {
      return {
        status: "ERR",
        message: "Password incorrect",
      };
    }
    const access_token = await generalAccessToken({
      id: checkUser.id,
      role: checkUser.role,
    });
    const refresh_token = await generalRefreshToken({
      id: checkUser.id,
      role: checkUser.role,
    });
    return {
      status: "OK",
      message: "SUCCESS",
      checkUser,
      access_token,
      refresh_token,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const updateUser = async (id: string, data: Partial<IUser>) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: "ERROR",
        message: "Invalid user ID",
      };
    }
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return {
        status: "ERROR",
        message: "User not found",
      };
    }
    if (data.password) {
      data.password = bcrypt.hashSync(data.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    return {
      status: "OK",
      message: "User updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      status: "ERROR",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const checkUser = await User.findById(new mongoose.Types.ObjectId(id));
    if (checkUser === null) {
      return {
        status: "OK",
        message: "User is not defined",
      };
    }
    await User.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    return {
      status: "OK",
      message: "Delete user success",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const getUser = async (id?: string, role?: string) => {
  try {
    if (id) {
      const getUserById = await User.findById(new mongoose.Types.ObjectId(id));
      if (!getUserById) {
        return {
          status: "ERR",
          message: "User not found",
        };
      }
      return {
        status: "OK",
        message: "SUCCESS",
        data: getUserById,
      };
    } else if (role) {
      const usersByRole = await User.find({ role });
      return {
        status: "OK",
        message: "SUCCESS",
        data: usersByRole,
      };
    } else {
      const allUsers = await User.find();
      return {
        status: "OK",
        message: "SUCCESS",
        data: allUsers,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const addPatientToDoctor = async (doctorId: string, patientId: string): Promise<string> => {
  try {
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const patient = await User.findById(patientObjectId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }

    const doctor = await User.findById(doctorObjectId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new Error('Doctor not found');
    }

    await doctor.addPatient(patientObjectId);

    return 'Patient added to doctor successfully';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const addDoctorToPatient = async (patientId: string, doctorId: string): Promise<string> => {
  try {
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const patient = await User.findById(patientObjectId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }

    const doctor = await User.findById(doctorObjectId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new Error('Doctor not found');
    }

    await patient.addDoctor(doctorObjectId);

    return 'Doctor added to patient successfully';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const removePatientFromDoctor = async (doctorId: string, patientIds: string[]): Promise<string> => {
  try {
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    const doctor = await User.findById(doctorObjectId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new Error('Doctor not found');
    }

    await Promise.all(
      patientIds.map(async (patientId) => {
        const patientObjectId = new mongoose.Types.ObjectId(patientId);
        return doctor.removePatient(patientObjectId);
      })
    );

    return 'Patients removed successfully';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "An unknown error occurred");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

export const removeDoctorFromPatient = async (patientId: string, doctorId: string): Promise<string> => {
  try {
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const patient = await User.findById(patientObjectId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }

    await patient.removeDoctor(doctorObjectId);

    return 'Doctor removed from patient successfully';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "An unknown error occurred");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};