import axios from 'axios';
import { ITest } from "../Types/types";
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

// Fetch all tests
export const getAllTests = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/test/get-all-tests`);
        return res.data.data;
    } catch (error) {
        console.error("Failed to fetch tests:", error);
        throw new Error("Failed to fetch tests");
    }
};

// Fetch a single test by ID
export const getTest = async (id?: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/test/get-test`, { params: { id } });
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch test with ID ${id}:`, error);
        throw new Error(`Failed to fetch test with ID ${id}`);
    }
};

export const getTestByName = async (test_name: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/test/get-test`, { params: { test_name } });
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch test with test_name ${test_name}:`, error);
        throw new Error(`Failed to fetch test with test_name ${test_name}`);
    }
};

// Create a new test
export const createTest = async (data: ITest) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/test/create-test`, data);
        return res.data;
    } catch (error) {
        console.error("Failed to create test:", error);
        throw new Error("Failed to create test");
    }
};

// Update an existing test by ID
export const updateTest = async (id: string, data: ITest) => {
    try {
        const res = await axios.put(`${API_BASE_URL}/test/update-test/${id}`, data);
        return res.data;
    } catch (error) {
        console.error(`Failed to update test with ID ${id}:`, error);
        throw new Error(`Failed to update test with ID ${id}`);
    }
};

// Delete a test by ID
export const deleteTest = async (id: string) => {
    try {
        const res = await axios.delete(`${API_BASE_URL}/test/delete-test/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to delete test with ID ${id}:`, error);
        throw new Error(`Failed to delete test with ID ${id}`);
    }
};
