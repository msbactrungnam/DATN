import { useQuery } from '@tanstack/react-query';
import { Doctor, Patient } from '../Types/types';
import * as UserService from '../Services/UserService';

const fetchDoctors = async (): Promise<Doctor[]> => {
    const data = await UserService.getUserByRole('doctor');
    if (!Array.isArray(data)) {
        throw new Error('Expected an array of doctors');
    }
    return data as Doctor[];
};

export const useDoctors = () => {
    return useQuery<Doctor[]>({
        queryKey: ['doctors'],
        queryFn: fetchDoctors,
    });
};

const fetchPatients = async (): Promise<Patient[]> => {
    const data = await UserService.getUserByRole('patient');
    if (!Array.isArray(data)) {
        throw new Error('Expected an array of patients');
    }
    return data as Patient[];
};

export const usePatients = () => {
    return useQuery<Patient[]>({
        queryKey: ['patients'],
        queryFn: fetchPatients,
    });
};