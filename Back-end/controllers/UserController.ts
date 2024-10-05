import { Request, Response } from "express";
import * as UserService from "../services/UserService";
import { refreshTokenJwtService } from "../services/JwtService";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, age, address, phone } = req.body;
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmail = reg.test(email);

    if (!email || !password || !name || !role || !age || !address || !phone) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isEmail) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format",
      });
    }

    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmail = reg.test(email);

    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isEmail) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format",
      });
    }

    const response = await UserService.loginUser(req.body);
    const { refresh_token, ...newResponse } = response;
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json(newResponse);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('refresh_token')
    return res.status(200).json({
      status: "OK",
      message: "Logout Successfully",
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "UserId is required",
      });
    }
    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "UserId is required",
      });
    }
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id, role } = req.query;
    const response = await UserService.getUser(id as string, role as string);
    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};

export const addPatientToDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId, patientId } = req.body;
    const response = await UserService.addPatientToDoctor(doctorId, patientId);
    return res.status(200).json({ message: response });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};

export const addDoctorToPatient = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId } = req.body;
    const response = await UserService.addDoctorToPatient(patientId, doctorId);
    return res.status(200).json({ message: response });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({
        message: e.message,
      });
    } else {
      return res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(400).json({
        status: "ERR",
        message: "The token is required",
      });
    }

    const response = await refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(400).json({
        status: "ERR",
        message: e.message,
      });
    } else {
      return res.status(500).json({
        status: "ERR",
        message: "An unknown error occurred",
      });
    }
  }
};

export const removePatientFromDoctor = async (req: Request, res: Response) => {
  const { doctorId, patientIds } = req.body;
  try {
    const result = await UserService.removePatientFromDoctor(doctorId, patientIds);
    res.status(200).json({ message: result });
  } catch (e: unknown) {
    if (e instanceof Error) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const removeDoctorFromPatient = async (req: Request, res: Response) => {
  const { patientId, doctorId } = req.body;
  try {
    const result = await UserService.removeDoctorFromPatient(patientId, doctorId);
    res.status(200).json({ message: result });
  } catch (e: unknown) {
    if (e instanceof Error) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};
