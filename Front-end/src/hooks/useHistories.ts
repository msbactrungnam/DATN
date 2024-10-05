import { useQuery } from '@tanstack/react-query';
import { IHistory } from '../Types/types';
import * as HistoryService from '../Services/HistoryService';

const fetchHistories = async (): Promise<IHistory[]> => {
    const data = await HistoryService.getAllHistories();
    if (!Array.isArray(data)) {
        throw new Error('Expected an array of histories');
    }
    return data;
};

export const useHistories = () => {
    return useQuery<IHistory[]>({
        queryKey: ['histories'],
        queryFn: fetchHistories,
    });
};