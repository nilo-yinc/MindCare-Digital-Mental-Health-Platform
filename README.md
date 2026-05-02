<div align="center">
  <img src="frontend/public/3d_realistic_brain_hero.png" width="200" alt="MindCare Logo" />
  <h1>MindCare</h1>
  <p><strong>A High-Fidelity Digital Mental Health Ecosystem for Higher Education</strong></p>

  [![Status](https://img.shields.io/badge/Status-Operational-00F5D4?style=for-the-badge)]()
  [![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)]()
  [![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-61DAFB?style=for-the-badge&logo=react)]()
  [![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)]()
</div>

---

## 🌟 Overview

MindCare is a comprehensive digital wellness platform engineered to address the unique psychological challenges faced by students in higher education. By combining **Predictive Analytics**, **Conversational AI**, and **Peer Connectivity**, MindCare provides a safe, anonymous, and scientifically-grounded environment for emotional growth and crisis prevention.

## 📸 Platform Interface

<div align="center">
  <img src="frontend/public/3d_abstract_mental_health_asset.png" width="800" alt="MindCare Dashboard Preview" />
  <p><em>(Placeholder for Platform Screenshot: Dynamic Student Dashboard)</em></p>
</div>

---

## 🚀 Core Features

### 🧠 AI Sanctuary
A state-of-the-art conversational interface powered by large language models. It provides 24/7 empathetic support, utilizing Cognitive Behavioral Therapy (CBT) principles to help students navigate stress and anxiety.

### 📊 Digital Twin Analytics
A proactive wellness engine that monitors mood trajectories and behavioral patterns. It generates "Digital Twin Insights" to predict potential burnout risks before they manifest.

### 🤝 Peer Support Network
A moderated, anonymous space where students can share experiences and build community resilience through shared empathy and peer-led groups.

### 📅 Expert Care Integration
Direct integration with university counseling services, allowing students to seamlessly transition from self-care to professional clinical consultation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion, GSAP, Recharts |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Intelligence** | Google Gemini API (NLP), Predictive Stress Modeling |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Communications** | Google Apps Script Bridge (Email), Custom SMS Gateway |

---

## 🏗️ System Architecture

MindCare utilizes a **Monolithic Service Architecture** with a clear separation of concerns:

- **Client Tier:** A responsive Single Page Application (SPA) with stateful context management and real-time animation controllers.
- **API Tier:** A secure RESTful gateway implementing middleware for authentication, rate limiting, and activity logging.
- **Data Tier:** A document-oriented storage system optimized for time-series mood data and encrypted user profiles.
- **Inference Tier:** A failover-ready AI service layer that aggregates data from multiple LLM providers for maximum reliability.

---

## 🔧 Installation & Setup

### 1. Repository Setup
```bash
git clone https://github.com/nilo-yinc/MindCare-Digital-Mental-Health-Platform.git
cd MindCare-Digital-Mental-Health-Platform
```

### 2. Backend Configuration
Navigate to the `/backend` directory and create a `.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
APPS_SCRIPT_WEBHOOK_URL=your_email_webhook_url
```
`npm install && npm start`

### 3. Frontend Configuration
Navigate to the `/frontend` directory and create a `.env` file:
```env
VITE_API_URL=http://localhost:3000
```
`npm install && npm run dev`

---

## 📈 Roadmap

- [ ] **Mobile Application:** React Native port for native iOS and Android experiences.
- [ ] **Wearable Integration:** Real-time stress tracking via biometric data (Fitbit/Apple Watch).
- [ ] **Multi-Lingual Support:** Expanding AI support to regional Indian languages.
- [ ] **Blockchain Credentials:** Secure, immutable storage for clinical session logs.

---

<div align="center">
  <p>Developed with ❤️ for Student Mental Wellbeing</p>
</div>
