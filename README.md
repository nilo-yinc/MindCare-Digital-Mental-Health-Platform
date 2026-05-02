<div align="center">
  <img src="frontend/public/logo.png" width="250" alt="MindCare Logo" />
  
  <h1>MindCare: Digital Mental Health Platform</h1>
  
  <p align="center">
    <strong>Empowering Student Wellness through Predictive AI and Peer Connectivity</strong>
  </p>

  <div align="center">
    <a href="https://mind-care-digital-mental-health.vercel.app/">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_Platform-00F5D4?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
  </div>

  <br />

  [![Status](https://img.shields.io/badge/Production-Stable-success?style=flat-square)]()
  [![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)]()
  [![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)]()
  [![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=flat-square&logo=mongodb)]()
</div>

---

## 📸 Platform Interface

<div align="center">
  <h3>✨ Modern, Intuitive & Empathetic UI</h3>
  <!-- USER: Replace 'dashboard_ss.png' with your actual screenshot in frontend/public/docs/ -->
  <img src="frontend/public/docs/dashboard_ss.png" width="900" alt="MindCare Student Dashboard" style="border-radius: 10px; border: 1px solid #333;" />
  <p><em>Comprehensive Student Dashboard featuring Mood Trajectories, AI Companion, and Peer Buddy access.</em></p>
</div>

<br />

<div align="center">
  <table style="width: 100%;">
    <tr>
      <td width="50%">
        <!-- USER: Replace 'ai_ss.png' with your actual screenshot -->
        <img src="frontend/public/docs/ai_ss.png" width="100%" alt="AI Sanctuary" style="border-radius: 8px;" />
        <p align="center"><strong>AI Sanctuary Chat</strong></p>
      </td>
      <td width="50%">
        <!-- USER: Replace 'twin_ss.png' with your actual screenshot -->
        <img src="frontend/public/docs/twin_ss.png" width="100%" alt="Digital Twin" style="border-radius: 8px;" />
        <p align="center"><strong>Digital Twin Insights</strong></p>
      </td>
    </tr>
  </table>
</div>

---

## 🏛️ System Architecture

MindCare is built on a high-performance **MERN Stack** with a modular, tiered architecture designed for scalability and clinical reliability.

### 🔳 3D Layered Architecture Diagram

```mermaid
graph TD
    subgraph "Presentation Layer (Client-Side)"
        UI["<b>Frontend (React + TS)</b><br/>Framer Motion / GSAP<br/>Tailwind CSS / Recharts"]
    end

    subgraph "Logic & Intelligence Layer (Server-Side)"
        API["<b>Express API Gateway</b><br/>JWT Auth / Middlewares<br/>Controller Logic"]
        AI["<b>AI Engine</b><br/>Gemini Pro / Grok LLMs<br/>Contextual Memory"]
    end

    subgraph "Persistence Layer (Data-Store)"
        DB[("<b>MongoDB Atlas</b><br/>User Profiles<br/>Mood Time-Series<br/>Activity Logs")]
    end

    subgraph "Communication Services"
        Mail["<b>Apps Script Bridge</b><br/>SMTP / Automated Triggers"]
    end

    UI <==> API
    API <==> AI
    API <==> DB
    API --- Mail
```

---

## 🚀 Key Modules & Innovations

### 🛠️ The AI Sanctuary
A stateful, context-aware conversational terminal that serves as a student's first point of contact.
- **Agentic Logic:** Uses session-based history to maintain a continuous support loop.
- **Clinical Empathy:** Trained on CBT (Cognitive Behavioral Therapy) frameworks to provide validated coping strategies.

### 🧬 Digital Twin Analytics
A proactive wellness engine that creates a behavioral profile of the student.
- **Stress Prediction:** Analyzes mood inputs and identifies stressors before burnout occurs.
- **Personalized Recommendations:** Suggests specific resources based on identified stressors (e.g., Exam Pressure vs. Loneliness).

### 👥 Peer Buddy & Peer Groups
A moderated environment facilitating community resilience.
- **Peer Buddy:** Direct, anonymous peer-to-peer support.
- **Peer Groups:** Interest-based mental health support circles.

### 🏥 Expert Consultations
A bridge between digital self-care and professional clinical intervention.
- **Seamless Booking:** Real-time scheduling with university counsellors.
- **Automated Alerts:** Clinical confirmations sent via secure email/SMS channels.

---

## 🛠️ Technical Implementation Details

### **Tech Stack Deep Dive**
- **Frontend Core:** React 18, TypeScript (Type-safe components).
- **Animation Framework:** GSAP & Framer Motion for premium, hardware-accelerated transitions.
- **State Management:** React Context API for localized state and auth persistence.
- **Backend Architecture:** RESTful Node.js API with Mongoose ODM.
- **Infrastructure:** Vercel (Frontend), Render (Backend), MongoDB Atlas (DB).

---

## 🛠️ Setup & Installation

### **1. Environment Variables**
Configure the following in your `.env` files:

**Backend (`/backend/.env`):**
```env
PORT=3000
MONGODB_URI=...
JWT_SECRET=...
GEMINI_API_KEY=...
APPS_SCRIPT_WEBHOOK_URL=...
```

**Frontend (`/frontend/.env`):**
```env
VITE_API_URL=https://your-backend-url.com
```

### **2. Launching the Platform**
```bash
# Install root dependencies
npm install

# Start Backend
cd backend
npm install
npm start

# Start Frontend
cd ../frontend
npm install
npm run dev
```

---

<div align="center">
  <p><strong>Developed for the University Mental Health Initiative</strong></p>
  <p><em>Advancing mental health support through digital innovation.</em></p>
</div>
