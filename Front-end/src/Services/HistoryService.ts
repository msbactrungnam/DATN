import axios from 'axios';
import { IHistory } from "../Types/types";
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

export const getAllHistories = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/history/get-all-histories`);
        return res.data.data;
    } catch (error) {
        console.error("Failed to fetch histories:", error);
        throw new Error("Failed to fetch histories");
    }
};

export const getHistory = async (id: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/history/get-history`, { params: { id } });
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch History with ID ${id}:`, error);
        throw new Error(`Failed to fetch History with ID ${id}`);
    }
};

export const createHistory = async (data: IHistory) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/history/create-history`, data);
        return res.data;
    } catch (error) {
        console.error("Failed to create history:", error);
        throw new Error("Failed to create history");
    }
};

export const updateHistory = async (id: string, data: IHistory) => {
    try {
        const res = await axios.put(`${API_BASE_URL}/history/update-history/${id}`, data);
        return res.data;
    } catch (error) {
        console.error(`Failed to update history with ID ${id}:`, error);
        throw new Error(`Failed to update history with ID ${id}`);
    }
};

export const deleteHistory = async (id: string) => {
    try {
        const res = await axios.delete(`${API_BASE_URL}/history/delete-history/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to delete history with ID ${id}:`, error);
        throw new Error(`Failed to delete history with ID ${id}`);
    }
};
