import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

export const createQuiz = async (req, res) => {
    try {
        const { topic, difficulty, name } = req.body;

        // Validate input
        if (!topic || !difficulty) {
            return res.status(400).render('pages/error', {
                error: 'Invalid Input',
                message: 'Topic and difficulty are required'
            });
        }

        // Prepare prompt for Gemini API
        const prompt = `Generate 5 multiple choice questions specifically about ${topic} (which could be a movie name, actor name, or movie-related topic) from ${difficulty} difficulty level. 
        Each question should have 4 options and 1 correct answer.
        Make sure the questions are directly related to ${topic} and include interesting facts or details.
        For example, if the topic is "Shah Rukh Khan", questions could be about his movies, awards, or career milestones.
        If the topic is "Inception", questions could be about the plot, cast, or behind-the-scenes facts.
        Return ONLY the JSON object with the following structure, without any markdown formatting or additional text:
        {
            "questions": [
                {
                    "question": "Question text",
                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                    "correctAnswer": "Correct option"
                }
            ]
        }`;

        // Call Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.data.candidates || !response.data.candidates[0].content.parts[0].text) {
            throw new Error('Invalid response from Gemini API');
        }

        // Extract and clean the response text
        let responseText = response.data.candidates[0].content.parts[0].text;
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse the cleaned JSON
        let quizData;
        try {
            quizData = JSON.parse(responseText);
        } catch (error) {
            console.error('Failed to parse quiz data:', responseText);
            throw new Error('Failed to parse quiz data from API response');
        }

        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid quiz data structure');
        }

        // Create quiz object
        const quiz = {
            id: Date.now().toString(),
            topic,
            difficulty,
            participantName: name,
            questions: quizData.questions,
            currentQuestion: 0,
            score: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Store quiz in session
        req.session.quiz = quiz;
        
        res.redirect('/quiz');

    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).render('pages/error', { 
            message: 'Failed to create quiz. Please try again.' 
        });
    }
};

export const getQuiz = (req, res) => {
    try {
        const quiz = req.session.quiz;
        if (!quiz) {
            return res.status(404).render('pages/error', {
                error: 'Quiz Not Found',
                message: 'No active quiz found. Please start a new quiz.'
            });
        }

        // Get the current question index from the quiz object
        const currentQuestion = quiz.currentQuestion || 0;
        const question = quiz.questions[currentQuestion];

        if (!question) {
            return res.status(404).render('pages/error', {
                error: 'Question Not Found',
                message: 'No question found for the current quiz.'
            });
        }

        res.render('pages/quiz', {
            question: question,
            currentQuestion: currentQuestion,
            totalQuestions: quiz.questions.length
        });
    } catch (error) {
        console.error('Error getting quiz:', error);
        res.status(500).render('pages/error', {
            error: 'Internal Server Error',
            message: 'Failed to load quiz. Please try again.'
        });
    }
};

export const submitAnswer = (req, res) => {
    try {
        const { answer } = req.body;
        const quiz = req.session.quiz;

        if (!quiz) {
            return res.status(404).render('pages/error', {
                error: 'Quiz Not Found',
                message: 'No active quiz found. Please start a new quiz.'
            });
        }

        if (!answer) {
            return res.status(400).render('pages/error', {
                error: 'Invalid Input',
                message: 'Please select an answer.'
            });
        }

        // Initialize answers array if it doesn't exist
        if (!quiz.answers) {
            quiz.answers = [];
        }

        // Get current question index
        const currentQuestion = quiz.currentQuestion || 0;

        // Store the user's answer and whether it was correct
        const isCorrect = answer === quiz.questions[currentQuestion].correctAnswer;
        quiz.answers.push({
            question: quiz.questions[currentQuestion].question,
            userAnswer: answer,
            correctAnswer: quiz.questions[currentQuestion].correctAnswer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            quiz.score = (quiz.score || 0) + 1;
        }

        // Move to next question or show results
        if (currentQuestion < quiz.questions.length - 1) {
            quiz.currentQuestion = currentQuestion + 1;
            res.redirect('/quiz');
        } else {
            quiz.completed = true;
            
            // Get existing history from session or initialize empty array
            const history = req.session.history || [];
            
            // Add completed quiz to history
            history.push({
                id: quiz.id,
                topic: quiz.topic,
                difficulty: quiz.difficulty,
                participantName: quiz.participantName,
                score: quiz.score,
                totalQuestions: quiz.questions.length,
                date: quiz.createdAt,
                answers: quiz.answers
            });
            
            // Update session history
            req.session.history = history;
            
            // Redirect to score page
            res.redirect('/score');
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).render('pages/error', {
            error: 'Internal Server Error',
            message: 'Failed to submit answer. Please try again.'
        });
    }
};

export const showScore = (req, res) => {
    try {
        const quiz = req.session.quiz;
        if (!quiz || !quiz.completed) {
            return res.status(404).render('pages/error', { 
                message: 'No completed quiz found' 
            });
        }

        // Calculate score percentage
        const scorePercentage = (quiz.score / quiz.questions.length) * 100;
        
        // Get existing history from session or initialize empty array
        const history = req.session.history || [];
        
        // Check if this quiz is already in history
        const isDuplicate = history.some(item => item.id === quiz.id);
        
        // Only add to history if it's not already there
        if (!isDuplicate) {
            history.push({
                id: quiz.id,
                topic: quiz.topic,
                difficulty: quiz.difficulty,
                participantName: quiz.participantName,
                score: quiz.score,
                totalQuestions: quiz.questions.length,
                date: quiz.createdAt,
                answers: quiz.answers
            });
            req.session.history = history;
        }

        // Determine performance rating
        let performanceRating = '';
        let emoji = '';
        
        if (scorePercentage >= 80) {
            performanceRating = 'Excellent!';
            emoji = '🎬';
        } else if (scorePercentage >= 60) {
            performanceRating = 'Good!';
            emoji = '🎥';
        } else if (scorePercentage >= 40) {
            performanceRating = 'Not bad!';
            emoji = '🍿';
        } else {
            performanceRating = 'Keep trying!';
            emoji = '🎞️';
        }

        res.render('pages/score', {
            quiz,
            score: quiz.score,
            totalQuestions: quiz.questions.length,
            scorePercentage: Math.round(scorePercentage),
            performanceRating,
            emoji,
            answers: quiz.answers || []
        });
    } catch (error) {
        console.error('Error showing score:', error);
        res.status(500).render('pages/error', { 
            message: 'Failed to show score. Please try again.' 
        });
    }
};

export const showHistory = (req, res) => {
    try {
        const history = req.session.history || [];
        res.render('pages/history', { quizzes: history });
    } catch (error) {
        console.error('Error showing history:', error);
        res.redirect('/?error=history_failed');
    }
};

export const startNewQuiz = (req, res) => {
    res.redirect('/?quizEnd=true');
};

export const showHome = (req, res) => {
    res.render('pages/home', { 
        participantName: req.session.participantName || null,
        fromHistory: req.query.fromHistory === 'true'
    });
};

export const startQuiz = (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send('Name is required');
    }
    req.session.participantName = name;
    res.redirect('/');
};

export const newParticipant = (req, res) => {
    // Clear the current participant name from session
    req.session.participantName = null;
    // Redirect to home page to start fresh
    res.redirect('/');
}; 