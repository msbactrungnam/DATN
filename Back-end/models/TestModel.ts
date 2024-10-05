import mongoose, { Document, Schema } from "mongoose";

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
const testSchema: Schema = new Schema({
    test_name: {
        type: String,
        required: true,
    },
    difficult: {
        type: String,
        required: true,
    },
    type: {
        type: String,
    },
    question: {
        type: String,
        required: true,
    },
    answers: {
        A: String,
        B: String,
        C: String,
        D: String,
    },
    correct_answer: {
        type: String,
        enum: ["A", "B", "C", "D", "True"],
    },
    score: {
        type: String,
        required: true,
    },
});

const Test = mongoose.model<ITest>("Test", testSchema);

export default Test;
