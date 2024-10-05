import mongoose, { Document } from "mongoose";
import Test from '../models/TestModel'; // Assume you have a Test model

interface ITest extends Document {
    test_name: string;
    score: string;
    question: string;
    difficult: string;
    type: string;
    answers?: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correct_answer?: "A" | "B" | "C" | "D" | "True";
}

export const createTest = async (newTest: ITest) => {
    const { test_name, question, type, difficult, answers, correct_answer, score } = newTest;
    try {
        const createdTest = await Test.create({
            test_name,
            question,
            type,
            difficult,
            answers,
            correct_answer,
            score,
        });

        if (createdTest) {
            return {
                status: "OK",
                message: "Test created successfully",
                data: createdTest,
            };
        } else {
            return {
                status: "ERR",
                message: "Failed to create the test",
            };
        }
    } catch (error) {
        const err = error as Error; // Cast to Error
        throw new Error(err.message || "An unknown error occurred");
    }
};

export const getTest = async (id?: string, test_name?: string) => {
    try {
        if (id) {
            const getTestById = await Test.findById(new mongoose.Types.ObjectId(id));
            if (!getTestById) {
                return {
                    status: "ERR",
                    message: "Test not found",
                };
            }
            return {
                status: "OK",
                message: "SUCCESS",
                data: getTestById,
            };
        } else if (test_name) {
            const getTestByName = await Test.find({ test_name });
            if (!getTestByName) {
                return {
                    status: "ERR",
                    message: "Test not found",
                };
            }
            return {
                status: "OK",
                message: "SUCCESS",
                data: getTestByName,
            };
        }
    } catch (error) {
        const err = error as Error; // Cast to Error
        throw new Error(err.message || "An unknown error occurred");
    }
};

export const updateTest = async (id: string, data: Partial<ITest>) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                status: "ERROR",
                message: "Invalid test ID",
            };
        }
        const updatedTest = await Test.findByIdAndUpdate(id, data, { new: true });
        return {
            status: "OK",
            message: "Test updated successfully",
            data: updatedTest,
        };
    } catch (error) {
        const err = error as Error; // Cast to Error
        throw new Error(err.message || "An unknown error occurred");
    }
};

export const deleteTest = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return {
                status: "ERROR",
                message: "Invalid test ID",
            };
        }
        await Test.findByIdAndDelete(id);
        return {
            status: "OK",
            message: "Test deleted successfully",
        };
    } catch (error) {
        const err = error as Error; // Cast to Error
        throw new Error(err.message || "An unknown error occurred");
    }
};

export const getAllTests = async () => {
    try {
        const tests = await Test.find();
        return {
            status: "OK",
            message: "SUCCESS",
            data: tests,
        };
    } catch (error) {
        const err = error as Error; // Cast to Error
        throw new Error(err.message || "An unknown error occurred");
    }
};
