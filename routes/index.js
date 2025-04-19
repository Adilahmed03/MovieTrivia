import express from 'express';
import { generateQuiz, submitAnswer } from '../controllers/quizController.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('pages/home');
});

// Generate quiz
router.post('/quiz', generateQuiz);

// Submit answer
router.post('/submit-answer', submitAnswer);

// History route
router.get('/history', (req, res) => {
    try {
        // Read quiz history from JSON file
        const historyPath = path.join(__dirname, '../history.json');
        let quizHistory = [];
        
        if (fs.existsSync(historyPath)) {
            const historyData = fs.readFileSync(historyPath, 'utf8');
            quizHistory = JSON.parse(historyData);
        }

        res.render('pages/history', { quizHistory });
    } catch (error) {
        console.error('Error reading quiz history:', error);
        res.status(500).json({ error: 'Failed to load quiz history' });
    }
});

// Save quiz history
router.post('/save-history', (req, res) => {
    try {
        const { quizHistory } = req.body;
        const historyPath = path.join(__dirname, '../history.json');
        
        // Read existing history
        let existingHistory = [];
        if (fs.existsSync(historyPath)) {
            const historyData = fs.readFileSync(historyPath, 'utf8');
            existingHistory = JSON.parse(historyData);
        }

        // Add new history entry
        existingHistory.push(quizHistory);

        // Write updated history
        fs.writeFileSync(historyPath, JSON.stringify(existingHistory, null, 2));

        res.status(200).json({ message: 'History saved successfully' });
    } catch (error) {
        console.error('Error saving quiz history:', error);
        res.status(500).json({ error: 'Failed to save quiz history' });
    }
});

export default router; 