import { Request, Response } from 'express';
import * as historyService from '../services/HistoryService';

export const createHistory = async (req: Request, res: Response) => {
  try {
    const newHistory = req.body;
    const result = await historyService.createHistory(newHistory);
    return res.status(200).json(result);
  } catch (error) {
    const err = error as Error;  // Cast to Error
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await historyService.getHistory(id as string);
    return res.status(200).json(result);
  } catch (error) {
    const err = error as Error;  // Cast to Error
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
};

export const updateHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await historyService.updateHistory(id, updateData);
    return res.status(200).json(result);
  } catch (error) {
    const err = error as Error;  // Cast to Error
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
};

export const deleteHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await historyService.deleteHistory(id);
    return res.status(200).json(result);
  } catch (error) {
    const err = error as Error;  // Cast to Error
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
};

export const getAllHistories = async (req: Request, res: Response) => {
  try {
    const result = await historyService.getAllHistories();
    return res.status(200).json(result);
  } catch (error) {
    const err = error as Error;  // Cast to Error
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
};
