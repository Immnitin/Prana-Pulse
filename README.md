# 🩺 Prana Pulse: AI-Powered Preventive Health Assessment

**Prana Pulse** is a modern, AI-driven web application designed to predict an individual's risk of chronic lifestyle diseases such as **diabetes**, **hypertension**, and **cardiovascular disease**. By collecting self-reported health data, the app generates an instant **risk score** and personalized, **evidence-backed preventive recommendations** using AI.

This project was built during a hackathon focused on leveraging AI for early disease risk prediction—aiming to close the gap in preventive healthcare caused by **cost, access, and awareness limitations**.

---

## ✨ Key Features

- 🔐 **Secure User Authentication**  
  Complete login and registration system powered by **Firebase Authentication**. User data is securely stored in **Firestore**.

- 📋 **Comprehensive Health Assessment**  
  A user-friendly single-page form to gather data across **demographics**, **vitals**, **labs**, and **lifestyle** factors.

- 🤖 **AI-Generated Recommendations**  
  Uses **OpenRouter API** (Nous Hermes 2 Pro - Llama 3 8B) to provide personalized preventive plans, including:
  - Dietary guidance
  - Activity goals
  - Screening suggestions

- 🧭 **Dual-View Dashboard**
  - **User View:** Displays risk score, trends, top risk factors, and actionable reminders.
  - **Clinician View:** Offers tools for cohort stratification, outreach prioritization, and adherence tracking.

- 🎨 **Modern & Responsive UI**  
  Designed using **Tailwind CSS** with smooth transitions via **Framer Motion** for seamless multi-device usage.

- 📍 **Geolocation Support**  
  Auto-fills user location on registration using a "Get Location" button.

---

## 🚀 Tech Stack

- **Frontend:** React (Vite), React Router  
- **Styling:** Tailwind CSS  
- **Animation:** Framer Motion  
- **Backend & Database:** Firebase (Authentication & Firestore)  
- **AI Integration:** OpenRouter API (Nous Hermes 2 Pro - Llama 3 8B)  
- **Optional 3D Support:** Three.js

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)  
- npm

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/prana-pulse.git
   cd prana-pulse
