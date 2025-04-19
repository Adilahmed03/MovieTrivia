# Movie Quiz Web Application

A dynamic movie quiz web application that generates questions using the Gemini API. The app allows users to input movie-related topics, choose difficulty levels, and track their quiz history.

## Features

- Dynamic quiz generation using Gemini API
- Multiple difficulty levels (Easy, Medium, Hard)
- Movie-specific questions (Hollywood, Bollywood, Tollywood)
- Quiz history tracking
- Responsive design with Tailwind CSS
- Dark mode support
- Session management

## Tech Stack

- Frontend:
  - HTML5 + CSS3
  - JavaScript (ES6+)
  - EJS templates
  - Tailwind CSS
  - Font Awesome icons

- Backend:
  - Node.js
  - Express.js
  - Axios
  - dotenv

- Storage:
  - Local JSON file for quiz history

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Gemini API key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd movie-quiz-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   SESSION_SECRET=your_session_secret_here
   NODE_ENV=development
   ```

4. Build Tailwind CSS:
   ```bash
   npm run build:css
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
project-root/
│
├── public/
│   ├── css/ (tailwind.css)
│   └── js/ (client-side JS)
│
├── views/
│   ├── partials/ (header.ejs, footer.ejs)
│   ├── pages/
│   │   ├── home.ejs
│   │   ├── quiz.ejs
│   │   ├── score.ejs
│   │   └── history.ejs
│
├── routes/
│   └── index.js
│
├── controllers/
│   └── quizController.js
│
├── history.json (for local quiz data)
├── .env
├── app.js
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Gemini API for question generation
- Tailwind CSS for styling
- Font Awesome for icons 