# WITSCRIBE

WITSCRIBE is a modern quiz application that allows users to create, take, and manage quizzes with real-time scoring and interactive features.

## Features

- Create and manage quizzes
- Real-time quiz taking experience
- Timer-based questions
- Immediate feedback on answers
- Score tracking
- Color-coded answer system
- Responsive design
- User-friendly interface

## Getting Started for New Users

### Step 1: Clone the Repository
1. Open your terminal or command prompt
2. Navigate to the directory where you want to clone the project
3. Run the following command:
bash
git clone https://github.com/yourusername/WITSCRIBE.git

4. Navigate into the project directory:
bash
cd WITSCRIBE


### Step 2: Install Dependencies
1. Make sure you have Node.js and npm installed
2. Run the following command to install all required dependencies:
bash
npm install

3. Wait for the installation to complete (this might take a few minutes)

### Step 3: Environment Setup
1. Create a new file named .env in the root directory
2. Add the following environment variables:
env
REACT_APP_API_KEY=your_api_key_here

3. Save the file

### Step 4: Start the Development Server
1. Run the following command:
bash
npm start

2. The application will automatically open in your default browser at http://localhost:3000
3. If it doesn't open automatically, manually open your browser and navigate to http://localhost:3000

### Step 5: Verify Installation
1. You should see the WITSCRIBE homepage
2. Check if all features are working:
   - Navigation menu
   - Quiz creation
   - Quiz taking functionality
   - Timer system
   - Score tracking

### Troubleshooting Common Issues

1. *If you get a "module not found" error:*
   bash
   # Delete node_modules folder and package-lock.json
   rm -rf node_modules package-lock.json
   # Reinstall dependencies
   npm install
   

2. *If the development server won't start:*
   bash
   # Check if port 3000 is in use
   # On Windows:
   netstat -ano | findstr :3000
   # On Mac/Linux:
   lsof -i :3000
   
   # Kill the process if needed
   # On Windows:
   taskkill /PID <PID> /F
   # On Mac/Linux:
   kill -9 <PID>
   

3. *If you see a blank page:*
   - Check the browser console for errors
   - Ensure all environment variables are set correctly
   - Try clearing your browser cache

4. *If styles are not loading:*
   bash
   # Rebuild Tailwind CSS
   npx tailwindcss init
   npm run build
   

### Additional Notes for New Users

- The project uses React 18 and requires Node.js version 14 or higher
- Make sure you have Git installed on your system
- If you're using Windows, you might need to run the terminal as administrator
- For Mac/Linux users, you might need to use sudo for some commands
- Keep your .env file secure and never commit it to version control

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

## Installation

1. Clone the repository:
bash
git clone https://github.com/yourusername/WITSCRIBE.git
cd WITSCRIBE


2. Install dependencies:
bash
npm install


3. Create a .env file in the root directory and add your environment variables:
env
REACT_APP_API_KEY=your_api_key_here


4. Start the development server:
bash
npm start


The application will be available at http://localhost:3000

## Dependencies

The project uses the following main dependencies:

json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "tailwindcss": "^3.2.4",
    "@heroicons/react": "^2.0.16"
  }
}


## Project Structure


WITSCRIBE/
├── src/
│   ├── Components/
│   │   ├── Navbar.jsx
│   │   └── ...
│   ├── Pages/
│   │   ├── PlayQuiz.jsx
│   │   └── ...
│   ├── App.jsx
│   └── index.js
├── public/
├── package.json
└── README.md


## Common Errors and Solutions

1. *Module not found error*
   - Solution: Run npm install to install missing dependencies
   - Check if the import path is correct

2. *Port already in use*
   - Solution: Kill the process using the port or use a different port
   bash
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   

3. *Environment variables not loading*
   - Solution: Ensure .env file exists in root directory
   - Restart the development server
   - Check if variable names start with REACT_APP_

4. *Tailwind CSS not working*
   - Solution: Ensure Tailwind is properly configured
   - Run npx tailwindcss init if config file is missing
   - Check if PostCSS is configured correctly

## API Keys and Configuration

1. *Required API Keys*
   - Create an account on the required service
   - Generate API key
   - Add to .env file:
   
   REACT_APP_API_KEY=your_api_key_here
   

2. *Environment Variables*
   - All environment variables must be prefixed with REACT_APP_
   - Never commit .env file to version control

## Development

1. *Starting Development Server*
bash
npm start


2. *Building for Production*
bash
npm run build


3. *Running Tests*
bash
npm test


## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@witscribe.com or open an issue in the GitHub repository.

## Acknowledgments

- React.js
- Tailwind CSS
- React Router
- All contributors and supporters of the project