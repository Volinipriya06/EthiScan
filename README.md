# EthiScan — AI-Powered Ethical Brand Intelligence Platform

EthiScan is a personal AI-powered ethical brand intelligence web application by Volini Priya. It helps users understand the sustainability and ethics profile of brands through live web intelligence, AI analysis, private account history, and a temporary guest mode.

## 🚀 Live Demo

- **Live Application:** https://volinipriya06.github.io/EthiScan/
- **GitHub Repository:** https://github.com/Volinipriya06/EthiScan
> The frontend is hosted on GitHub Pages and the backend is deployed on Render. MongoDB Atlas is used for database storage.

---

## ✨ Features

### 🔍 Live Brand Analysis
- Search for a brand directly from the web application.
- Uses live web search data to gather relevant sustainability and ethical information.
- Generates a dynamic AI-based evaluation for the searched brand.

### 🤖 AI Ethical Scoring
- Provides an ethical score for the analyzed brand.
- Includes sustainability information and industry classification.
- Explains positive indicators and ethical concerns.

### 🌱 Smart Ethical Alternatives
- Suggests alternative brands based on the AI analysis.
- Helps users explore potentially more ethical choices.

### 🔐 User Authentication
- User registration and login.
- Forgot-password and reset-password flow.
- JWT-based authentication.
- Passwords are securely hashed using bcrypt.

### 📊 Dashboard & Search History
- Saves search history only for logged-in users.
- Links each saved search to the authenticated user's private account ID.
- Shows guest searches only temporarily in the current tab session.
- Provides direct dashboard links to reopen previous brand results.

### 🛡️ Privacy & Key Security
- Guest searches are never saved to MongoDB.
- Users can only load their own private search history.
- JWT authentication is required for account history access.
- API keys, database URIs, and JWT secrets must stay in environment variables.
- Hardcoded production secrets are not allowed in committed source code.

### 🎨 Modern Interface
- Dark futuristic UI.
- Responsive layout.
- Smooth animations and interactive components.

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- GitHub Pages

### Backend
- Node.js
- Express.js
- Render

### Database
- MongoDB Atlas
- Mongoose

### AI & Web Intelligence
- OpenRouter AI API
- Serper Web Search API

### Authentication & Security
- JWT
- bcrypt.js
- CORS

---

## 🏗️ Architecture

```text
                    EthiScan
                       │
                       ▼
              GitHub Pages Frontend
                       │
                       ▼
               Render Backend API
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   Serper Web Search          OpenRouter AI
          │                         │
          └────────────┬────────────┘
                       ▼
                Ethical Analysis
                       │
                       ▼
                 MongoDB Atlas
                       │
                       ▼
              Dashboard & History
```

---

## 🌐 Deployment

EthiScan is deployed using a separate frontend and backend architecture:

| Component | Platform | Link |
|---|---|---|
| Frontend | GitHub Pages | https://volinipriya06.github.io/EthiScan/ |
| Source Code | GitHub | https://github.com/Volinipriya06/EthiScan |
| Database | MongoDB Atlas | Cloud database |

The GitHub Pages frontend sends API requests to the Render backend. The backend communicates with MongoDB Atlas, Serper, and OpenRouter to process brand searches and store authenticated users' search history.

---

## 💻 Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Volinipriya06/EthiScan.git
cd EthiScan
```

### 2. Navigate to the Backend

```bash
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env`, then add your real values locally or in Render environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
SERPER_API_KEY=your_serper_api_key
```

**Never commit the `.env` file or real API keys to GitHub.**

### 5. Start the Backend

```bash
node server.js
```

The local backend normally runs on:

```text
http://localhost:5000
```

---

## 📁 Project Structure

```text
EthiScan/
├── backend/
│   ├── models/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── css/
│   ├── js/
│   ├── components/
│   ├── index.html
│   ├── login.html
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── dashboard.html
│   └── register.html
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## 🔄 Application Flow

1. User opens the EthiScan web application.
2. User searches for a brand.
3. The frontend sends the request to the Render backend.
4. The backend collects relevant web information using Serper.
5. OpenRouter AI analyzes the collected information.
6. EthiScan generates an ethical score and supporting insights.
7. If the user is logged in, the backend saves the search with that user's ID.
8. If the user is browsing as a guest, the backend does not save the search.
9. Guest history is temporary and clears on refresh, tab close, or login.
10. Logged-in users can view only their own private history on the dashboard.

---

## Future Updates (To-Do List)

- Add a production email service for forgot-password reset links.
- Add a user profile page for account details and ethical preferences.
- Add stronger dashboard filters by date, score, and brand category.
- Add export options for private history, such as CSV or PDF.
- Add barcode scanning support.
- Add product-level ethical analysis.
- Add AI-powered ESG report generation.
- Add community verification and user-submitted evidence.
- Add multi-language support.
- Add admin moderation for reported or uncertain brand results.
- Add stricter rate limiting for auth and brand-analysis endpoints.
- Add automated security scanning before deployment.
- Rotate any keys that were ever exposed and keep all secrets in Render environment variables only.

---

## 👩‍💻 Project

**EthiScan — AI-Powered Ethical Brand Intelligence Platform**

GitHub: https://github.com/Volinipriya06/EthiScan

Live Demo: https://volinipriya06.github.io/EthiScan/
