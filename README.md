# 🌾 KisanSaathi

> AI-Powered Multilingual Crop Disease Diagnosis & Advisory Platform

KisanSaathi is a voice-first AI platform designed to help farmers identify crop diseases through natural conversations in their regional language. The platform combines speech recognition, conversational AI, image-assisted diagnosis, and text-to-speech capabilities to provide actionable agricultural recommendations without requiring technical knowledge or literacy.

---

## 🚜 Problem Statement

India's 140+ million small and marginal farmers often rely on intuition or word-of-mouth advice when making critical crop decisions. Existing agricultural advisory tools assume farmers already know the problem they are facing and are often inaccessible due to language barriers and complex interfaces.

KisanSaathi bridges this gap by conducting a guided conversation with farmers, asking relevant follow-up questions, analyzing crop images, and providing clear diagnosis and treatment recommendations.

---

## ✨ Key Features

### 🎙️ Voice-First Interaction
- Speak in regional languages
- Browser-based speech recognition
- Text-to-speech playback of AI responses

### 🤖 Conversational AI Diagnosis
- AI asks targeted follow-up questions
- Context-aware conversations
- Guided diagnosis instead of keyword matching

### 📸 Image-Based Crop Analysis
- Optional crop image uploads
- AI-assisted disease identification
- Improved diagnostic accuracy

### 🌐 Multilingual Support
- Regional language interactions
- Code-switching support (Hindi + English)
- Designed for low digital literacy users

### 📱 Responsive User Experience
- Mobile-first design
- Accessible UI/UX
- Optimized for rural users

---

# 🏗️ System Architecture

```text
Farmer
   │
   ▼
Voice / Text Input
   │
   ▼
Frontend (React + Vite)
   │
   ▼
FastAPI Backend
   │
   ├── Google Speech-to-Text
   │
   ├── Claude AI Diagnostic Engine
   │
   ├── Image Analysis Pipeline
   │
   └── Google Text-to-Speech
   │
   ▼
Diagnosis + Treatment Advice
   │
   ▼
Speech Playback
```

---

# 💻 Technology Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- React Speech Recognition
- React Router DOM
- Fetch API

## Backend

- FastAPI
- Python
- Claude AI (Anthropic)
- Google Cloud Speech-to-Text
- Google Cloud Text-to-Speech

## Deployment

- Frontend: Vercel
- Backend: Railway

---

# 📂 Project Structure

## Frontend

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Backend

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── prompts/
│   ├── services/
│   └── main.py
├── tests/
├── requirements.txt
└── README.md
```

---

# 🔄 User Workflow

```text
Open Website
      │
      ▼
Start Diagnosis
      │
      ▼
Speak / Type Problem
      │
      ▼
(Optional) Upload Crop Image
      │
      ▼
AI Follow-up Questions
      │
      ▼
User Responses
      │
      ▼
Disease Diagnosis
      │
      ▼
Treatment Recommendations
      │
      ▼
Speech Playback
```

---

# 🔌 API Endpoints

### Create Session

```http
POST /sessions
```

Creates a new diagnostic session.

---

### Text Diagnosis

```http
POST /chat/text
```

#### Request

```json
{
  "session_id": "string",
  "message": "string",
  "latitude": 0,
  "longitude": 0
}
```

---

### Image Diagnosis

```http
POST /chat/image
```

Uploads crop images for AI-assisted disease detection.

---

### Speech Playback

```http
POST /chat/speak
```

Converts AI responses into audio for farmers who prefer listening over reading.

---

# ⚙️ Engineering Highlights

- Modular frontend and backend architecture
- Session-based conversation management
- Voice and text interaction support
- AI-driven guided diagnosis workflow
- Provider abstraction for AI and speech services
- Image-assisted disease diagnosis
- Scalable FastAPI service architecture
- Error handling and fallback mechanisms
- Fully responsive user interface

---

# 🧪 Testing & Reliability

- Mocked external AI services for testing
- API validation and schema checks
- Session lifecycle testing
- Error handling for:
  - Speech recognition failures
  - Network interruptions
  - Invalid responses
  - Missing image uploads
  - Backend service downtime

---

# 🚀 Future Roadmap

### Phase 1
- Additional regional languages
- Multi-crop support
- Redis-based session storage

### Phase 2
- Weather-aware recommendations
- Pest intelligence integration
- Local input availability recommendations

### Phase 3
- Farmer profiles
- Crop health history
- Government scheme recommendations
- Insurance and agri-fintech integrations
- Analytics dashboard

---

# 👥 Team

### Frontend Development
- Aaliya Ashraf

### Backend Development
- Varnit Jain

### Project
**KisanSaathi – AI-Powered Crop Disease Diagnosis Assistant**

---

## 🌱 Vision

Empowering farmers with accessible, multilingual, AI-driven agricultural guidance through natural conversations, helping protect crops, improve productivity, and reduce preventable losses.
