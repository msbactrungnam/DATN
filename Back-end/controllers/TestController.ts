import { Request, Response } from 'express';
import * as testService from '../services/TestService';

export const createTest = async (req: Request, res: Response) => {
    try {
        const newTest = req.body;
        const result = await testService.createTest(newTest);
        return res.status(200).json(result);
    } catch (error) {
        const err = error as Error;  // Cast to Error
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
};

export const getTest = async (req: Request, res: Response) => {
    try {
        const { id, test_name } = req.query;
        const result = await testService.getTest(id as string, test_name as string);
        return res.status(200).json(result);
    } catch (error) {
        const err = error as Error;  // Cast to Error
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
};

export const updateTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const result = await testService.updateTest(id, updateData);
        return res.status(200).json(result);
    } catch (error) {
        const err = error as Error;  // Cast to Error
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
};

export const deleteTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await testService.deleteTest(id);
        return res.status(200).json(result);
    } catch (error) {
        const err = error as Error;  // Cast to Error
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
};

export const getAllTests = async (req: Request, res: Response) => {
    try {
        const result = await testService.getAllTests();
        return res.status(200).json(result);
    } catch (error) {
        const err = error as Error;  // Cast to Error
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
};
