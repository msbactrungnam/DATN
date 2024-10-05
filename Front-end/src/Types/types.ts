// types.ts
export interface User {
    _id: string;
    email: string;
    name: string;
    password: string;
    age?: number;
    address?: string;
    phone?: string;
    role: 'doctor' | 'patient' | 'admin';
    patients?: string[];
    doctor?: string;
    access_token?: string;
    refresh_token?: string;
}

export type Doctor = Omit<User, 'role' | 'doctor'> & {
    role: 'doctor';
    doctor?: never;
};

export type Patient = Omit<User, 'role' | 'patients'> & {
    role: 'patient';
    patients?: never;
};
export interface IPeer {
    userName: string;
    peerId: string;
}

export interface ITest {
    _id: string;
    test_name: string;
    score: string;
    question: string;
    type: string
    difficult: string;
    answers?: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correct_answer?: "A" | "B" | "C" | "D" | "True";
}

export interface IHistory {
    _id: string;
    patient_name: string;
    doctor_name: string;
    test_name?: string;
    difficult?: string
    date: Date;
    note?: string;
    score?: number
}