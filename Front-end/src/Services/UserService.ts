import axios from 'axios';
import { Doctor, Patient } from '../Types/types';
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    age: number;
    address?: string;
    phone?: string;
    role: 'doctor' | 'patient' | 'admin';
}

export interface UpdateUserData {
    email?: string;
    password?: string;
    name?: string;
    age?: number;
    address?: string;
    phone?: string;
    role?: 'doctor' | 'patient' | 'admin';
}

export interface PatientsData {
    doctorId: string;
    patientIds: string[];
}

export interface DoctorData {
    patientId: string;
    doctorId: string;
}
export interface RemoveLink {
    patientId: string;
    doctorId: string;
}
export const loginUser = async (data: { email: string; password: string }) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/user/sign-in`, data);
        return res.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Login failed");
    }
};
export const logoutUser = async () => {
    try {
        const res = await axios.post(`${API_BASE_URL}/user/logout`,);
        return res.data;
    } catch (error) {
        console.error("Logout failed:", error);
        throw new Error("Logout failed");
    }
};
export const createUser = async (data: RegisterData) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/user/sign-up`, data);
        return res.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("Registration failed");
    }
};

export const updateUser = async (id: string, data: UpdateUserData) => {
    try {
        const res = await axios.put(`${API_BASE_URL}/user/update-user/${id}`, data);
        return res.data;
    } catch (error) {
        console.error("Update failed:", error);
        throw new Error("Update failed");
    }
};

export const deleteUser = async (id: string) => {
    try {
        const res = await axios.delete(`${API_BASE_URL}/user/delete-user/${id}`);
        return res.data;
    } catch (error) {
        console.error("Delete failed:", error);
        throw new Error("Delete failed");
    }
};

export const getUser = async (id?: string) => {
    try {
        if (id) {
            const response = await axios.get(`${API_BASE_URL}/user/get-user`, { params: { id } });
            return response.data;
        }

        const response = await axios.get(`${API_BASE_URL}/user/get-user`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch users: ${error}`);
        throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
export const getUserByRole = async (role: 'doctor' | 'patient'): Promise<Doctor[] | Patient[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/get-user`, { params: { role } });
        const responseData = response.data.data;
        if (!Array.isArray(responseData)) {
            throw new Error('API response data is not an array');
        }

        return responseData;
    } catch (error) {
        console.error(`Failed to fetch users by role: ${error}`);
        throw new Error(`Failed to fetch users by role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const refreshToken = async () => {
    try {
        const res = await axios.post(`${API_BASE_URL}/user/refresh-token`, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.error("Token refresh failed:", error);
        throw new Error("Token refresh failed");
    }
};

// Add patients to doctor and return the updated result
export const addPatientToDoctor = async (data: { doctorId: string; patientId: string }): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/user/add-patient`, data);
    } catch (error) {
        console.error("Failed to add patient:", error);
        throw new Error("Failed to add patient");
    }
};

// Add doctor to patient and return the updated result
export const addDoctorToPatient = async (data: { patientId: string; doctorId: string }): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/user/add-doctor`, data);
    } catch (error) {
        console.error("Failed to add doctor:", error);
        throw new Error("Failed to add doctor");
    }
};

export const removePatientFromDoctor = async (data: { doctorId: string; patientId: string }): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/user/remove-patient/`, {
            doctorId: data.doctorId,
            patientIds: [data.patientId] // Changed to an array of strings
        });
    } catch (error) {
        console.error("Failed to remove patient:", error);
        throw new Error("Failed to remove patient");
    }
};

export const removeDoctorFromPatient = async (data: { patientId: string; doctorId: string }): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/user/remove-doctor/`, {
            patientId: data.patientId,
            doctorId: data.doctorId
        });
    } catch (error) {
        console.error("Failed to remove doctor:", error);
        throw new Error("Failed to remove doctor");
    }
};
