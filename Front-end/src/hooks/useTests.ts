import { useQuery } from '@tanstack/react-query';
import { ITest } from '../Types/types';
import * as TestService from '../Services/TestService';

const fetchTests = async (): Promise<ITest[]> => {
    const data = await TestService.getAllTests();
    if (!Array.isArray(data)) {
        throw new Error('Expected an array of tests');
    }
    return data;
};

export const useTests = () => {
    return useQuery<ITest[]>({
        queryKey: ['tests'],
        queryFn: fetchTests,
    });
};