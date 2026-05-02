# MindCare: Digital Mental Health Platform

MindCare is a comprehensive digital wellness ecosystem designed specifically for the higher education environment. It integrates personalized mood tracking, AI-driven emotional support, peer networking, and clinical consultation scheduling into a single, secure platform.

## Key Features

- **Personalized Dashboard:** A high-fidelity interface for students to monitor their wellness journey, mood trajectory, and engagement metrics.
- **AI Sanctuary:** An intelligent, context-aware support terminal that utilizes advanced natural language processing to provide clinical empathy and coping strategies.
- **Digital Twin Insights:** Real-time predictive analytics that identify potential stressors and burnout risks based on user behavior and state check-ins.
- **Expert Care Booking:** A streamlined system for students to connect with professional university counsellors for clinical consultations.
- **Peer Support Network:** A moderated peer-to-peer environment for shared experiences and community resilience.
- **Resource Hub:** A curated library of mental health resources, guided breathing tools, and mindfulness content.

## Tech Stack

### Frontend
- **React.js** with **TypeScript** for type-safe development.
- **Framer Motion** & **GSAP** for high-performance animations and interactive UI.
- **Tailwind CSS** for responsive, modern design.
- **Lucide React** for consistent iconography.

### Backend
- **Node.js** & **Express.js** for a robust RESTful API architecture.
- **MongoDB** with **Mongoose** for scalable, document-oriented data management.
- **Google Generative AI SDK** for sophisticated AI interventions.
- **JWT** for secure, stateless authentication.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- API keys for Gemini (AI) and Apps Script (Email)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MindCare-Digital-Mental-Health-Platform
   ```

2. **Backend Configuration:**
   - Navigate to `/backend`
   - Create a `.env` file with the following:
     ```env
     PORT=3000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secure_jwt_secret
     GEMINI_API_KEY=your_gemini_api_key
     APPS_SCRIPT_WEBHOOK_URL=your_email_webhook_url
     ```
   - Install dependencies: `npm install`

3. **Frontend Configuration:**
   - Navigate to `/frontend`
   - Create a `.env` file with:
     ```env
     VITE_API_URL=http://localhost:3000
     ```
   - Install dependencies: `npm install`

4. **Run Locally:**
   - From the root directory: `npm run dev`

## Architecture

The project follows a standard MVC (Model-View-Controller) architecture on the backend, ensuring a clean separation of concerns. The frontend is built with a component-driven approach, utilizing React Context for state management and modular services for API interactions.

## License

This project is developed for educational purposes as part of the University Mental Health Initiative.
