import express from 'express';
import { showHome, createQuiz, getQuiz, submitAnswer, showScore, showHistory, startQuiz, newParticipant } from '../controllers/quizController.js';

const router = express.Router();

// Home page route
router.get('/', showHome);

// Quiz routes
router.post('/start-quiz', startQuiz);
router.post('/create-quiz', createQuiz);
router.get('/quiz', getQuiz);
router.post('/submit-answer', submitAnswer);
router.get('/score', showScore);
router.get('/history', showHistory);
router.post('/new-participant', newParticipant);

export default router; 