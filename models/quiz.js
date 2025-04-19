import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String
    }],
    score: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz; 