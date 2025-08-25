# WarTek (Warung Tekno) - AI-Powered Tech Community Platform

A community-driven tech news and discussion website inspired by Reddit, enhanced with Google Gemini AI for intelligent content analysis.

## 🚀 Features

### Core Community Features

- 📰 Tech news posting and sharing
- 👤 User authentication (Email/Password + Google OAuth)
- 🗳️ Reddit-style voting system (upvote/downvote)
- 📱 Responsive design with Bootstrap 5
- 🔐 JWT-based authentication

### 🤖 AI-Powered Content Analysis

When viewing post details, users get access to three intelligent analysis tabs:

 **AI Summary** 📝

   - Concise, intelligent summaries of tech articles
   - Key points extraction for quick understanding
   - Perfect for busy professionals



## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** with Sequelize ORM
- **JWT** for authentication
- **Google Auth Library** for OAuth
- **Google Generative AI SDK** for Gemini integration
- **BCrypt** for password hashing

### Frontend

- **React 19** with Vite
- **Redux Toolkit** for state management
- **React Router 7** for navigation
- **Bootstrap 5** for responsive UI
- **Axios** for API communication

### AI Integration

- **Google Gemini Pro** for content analysis
- Specialized prompts for tech journalism
- Real-time AI analysis generation

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google Cloud Platform account
- Google Gemini API key

## 🔧 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd IP-RMT64
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd server
npm install
\`\`\`

### 3. Database Configuration

1. Create a PostgreSQL database
2. Update \`config/config.json\` with your database credentials
3. Run migrations:
   \`\`\`bash
   npx sequelize-cli db:migrate
   \`\`\`

### 4. Environment Variables

Create a \`.env\` file in the server directory:
\`\`\`env

# Google Gemini AI API Key

GEMINI_API_KEY=your-actual-gemini-api-key-here

# Add other environment variables as needed

\`\`\`

### 5. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing one
4. Go to "Get API Key" section
5. Create a new API key
6. Copy the key and paste it in your \`.env\` file

### 6. Frontend Setup

\`\`\`bash
cd ../client
npm install
\`\`\`

### 7. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized origins: \`http://localhost:5175\`
4. Update the Google Client ID in your frontend code

## 🚀 Running the Application

### Start Backend Server

\`\`\`bash
cd server
npm run dev
\`\`\`
The backend will run on http://localhost:3000

### Start Frontend Development Server

\`\`\`bash
cd client
npm run dev
\`\`\`
The frontend will run on http://localhost:5175

## 📖 API Endpoints

### Authentication

- \`POST /users/register\` - User registration
- \`POST /users/login\` - User login
- \`POST /users/google-auth\` - Google OAuth login

### Posts

- \`GET /posts\` - Get all posts
- \`GET /posts/:id\` - Get post by ID
- \`POST /posts\` - Create new post
- \`PUT /posts/:id\` - Update post
- \`DELETE /posts/:id\` - Delete post

### Voting

- \`POST /posts/:id/vote\` - Vote on a post (up/down)

### AI Analysis

- \`POST /ai/posts/:id/summary\` - Generate AI summary
- \`POST /ai/posts/:id/5w1h\` - Generate 5W1H analysis
- \`POST /ai/posts/:id/comparison\` - Generate market comparison
- \`POST /ai/posts/:id/analyze-all\` - Generate all analyses at once

## 🎯 How to Use AI Features

1. **Register/Login** to your account
2. **Create or browse** tech posts
3. **Click on any post** to view details
4. **See the AI Analysis tabs** right after the post title
5. **Click on any tab** to generate intelligent analysis:
   - 📝 **Summary**: Quick overview and key points
   - ❓ **5W1H**: Comprehensive journalism-style analysis
   - 📊 **Comparison**: Market positioning and competitive analysis

## 🔍 AI Analysis Examples

### Summary Tab Output

\`\`\`
Apple unveils the iPhone 15 Pro with revolutionary titanium design and advanced A17 Pro chip.
Key features include USB-C adoption, improved camera system with 5x optical zoom, and enhanced
gaming performance. The device maintains premium pricing while offering significant improvements
in durability and processing power.
\`\`\`


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent content analysis
- React and Redux teams for excellent frontend tools
- Bootstrap for responsive design components
- The open-source community for various packages used

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**: Check database connection and environment variables
2. **AI analysis fails**: Verify GEMINI_API_KEY is set correctly
3. **Google OAuth issues**: Check client ID and authorized origins
4. **Database errors**: Ensure PostgreSQL is running and migrations are applied

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure both frontend and backend servers are running
- Test API endpoints independently using tools like Postman

---

**Built with ❤️ for the tech community**
