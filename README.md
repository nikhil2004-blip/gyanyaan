<img width="1911" height="903" alt="image" src="https://github.com/user-attachments/assets/89ea36a2-8b0a-4815-b200-644a04700b90" /># 🚀 ISRO Mission Simulator - Gyanyaan 1.0

<div align="center">

![ISRO Mission Control](https://img.shields.io/badge/ISRO-Mission%20Control-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?style=for-the-badge&logo=firebase)


**An immersive, educational space mission simulator bringing India's Mars Orbiter Mission (Mangalyaan) to life through interactive gameplay.**

[🎮 Live Demo](https://whack25deploy.vercel.app/) | [📖 Documentation](#features) | [🎥 Video Demo]()

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Game Levels](#-game-levels)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [How to Play](#-how-to-play)
- [Special Features](#-special-features)
- [Screenshots](#-screenshots)
- [Team](#-team)


---

## 🌟 Overview

**ISRO Mission Simulator** is an interactive educational game that simulates India's groundbreaking **Mangalyaan (Mars Orbiter Mission)** - the historic mission that made India the first Asian nation to reach Mars orbit on its first attempt.

Through **8 challenging levels**, players experience the real physics, engineering challenges, and decision-making required to launch, navigate, and orbit a spacecraft around Mars. Each level is based on actual ISRO mission phases, complete with real data, mission requirements documents (MRDs), and educational content.

### 🎯 Mission Objectives

- **Educate**: Teach space physics, orbital mechanics, and mission planning
- **Engage**: Provide hands-on experience with real mission scenarios
- **Inspire**: Showcase India's achievements in space exploration
- **Challenge**: Test problem-solving skills with authentic space engineering challenges

---

## ✨ Features

### 🎮 Core Gameplay

- **8 Progressive Levels**: Each level represents a phase of the Mangalyaan mission
  - Level 1: Launch Sequence & Liftoff
  - Level 2: Stage Separation & Trajectory Control
  - Level 3: Earth Orbit Insertion
  - Level 4: Orbit Circularization
  - Level 5: Trans-Mars Injection (TMI)
  - Level 6: Mars Transfer Cruise Phase
  - Level 7: Mars Orbit Insertion (MOI)
  - Level 8: Mission Complete - Final Trivia Challenge

- **Real Physics Simulation**: Authentic gravity, thrust, fuel consumption, and orbital mechanics
- **Mission Requirements Documents (MRD)**: Detailed briefings before each level
- **Success/Failure Analysis**: Learn from mistakes with detailed feedback

### 🔐 Authentication System

- **Google OAuth Integration**: Secure sign-in utilizing Google APIs
- **Custom JWT Auth**: Stateless token-based session management
- **Dual Authentication**: Standard Email/Password options alongside SSO
- **Express Backend**: Dedicated auth verification via custom Node middleware

### 📊 Progress Tracking

- **MongoDB & Mongoose**: Fast, scalable NoSQL document persistence
- **Level Unlocking System**: Complete levels to unlock new missions
- **Mission Completion Status**: Track completed levels with visual indicators
- **Mission Summary**: View achievements and stats after completion
- **Multiple Missions**: Mangalyaan completed unlocks Chandrayaan-3

### 🎨 User Experience

- **Retro Pixel Aesthetic**: Nostalgic 80s space mission control design
- **Responsive Design**: Optimized for desktop and tablet
- **Smooth Animations**: Framer Motion for fluid transitions
- **3D Visuals**: React Three Fiber for planet rendering
- **Dynamic Theming**: Planet-synchronized color schemes
- **Custom Sound Effects**: Immersive audio feedback (optional)



### 📚 Educational Content

- **Mission Facts**: Real data from ISRO's Mangalyaan mission
- **Physics Explanations**: Simplified orbital mechanics concepts
- **Historical Context**: India's journey to Mars
- **Vocabulary**: Space terminology and definitions
- **Fun Facts**: Interesting trivia about space exploration

---

## 🎮 Game Levels

### Level 1: Launch Sequence & Liftoff
**Mission**: Execute perfect rocket launch sequence
- Monitor fuel levels and thrust
- Maintain trajectory within safe limits
- Avoid over-acceleration damage
- **Physics**: Newton's Third Law, Thrust-to-Weight Ratio

### Level 2: Stage Separation & Trajectory Control
**Mission**: Separate stages and maintain course
- Time stage separations correctly
- Balance fuel consumption
- Navigate through atmospheric layers
- **Physics**: Staging, Drag Forces, Trajectory Correction

### Level 3: Earth Orbit Insertion
**Mission**: Insert spacecraft into Earth orbit
- Achieve circular orbit at precise altitude
- Manage orbital velocity
- Execute burn maneuvers
- **Physics**: Orbital Velocity, Centripetal Force

### Level 4: Orbit Circularization
**Mission**: Stabilize orbit to perfect circle
- Fine-tune apogee and perigee
- Minimize eccentricity
- Conserve remaining fuel
- **Physics**: Elliptical Orbits, Hohmann Transfer

### Level 5: Trans-Mars Injection (TMI)
**Mission**: Launch toward Mars at precise window
- Calculate transfer orbit
- Execute TMI burn at exact time
- Set course for Mars encounter
- **Physics**: Interplanetary Transfer, Launch Windows

### Level 6: Mars Transfer - 300 Day Cruise
**Mission**: Maintain spacecraft during long journey
- Execute Trajectory Correction Maneuvers (TCMs)
- Point High-Gain Antenna to Earth
- Manage momentum wheels
- Recalibrate sensors
- **Real-time**: Simulates 300-day voyage

### Level 7: Mars Orbit Insertion (MOI)
**Mission**: Enter Mars orbit - The critical moment
- Execute braking burn with precision
- Achieve stable capture orbit
- Balance fuel for future operations
- **Historical**: The moment India made history

### Level 8: Mission Complete - Final Challenge
**Mission**: Answer trivia questions about the mission
- Test knowledge gained through gameplay
- Learn achievements of Mangalyaan
- Unlock mission summary
- **Reward**: Complete mission certificate

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **Vite 5.4** - Build tool and dev server
- **Framer Motion** - Animations and transitions
- **React Three Fiber** - 3D planet rendering
- **Lucide React** - Icon library
- **TailwindCSS** - Utility-first styling
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - API routing and middleware
- **Mongoose** - MongoDB object modeling
- **JSON Web Tokens (JWT)** - Stateless authentication
- **CORS & Helmet** - Security protocols

### Database
- **MongoDB Atlas** - Cloud NoSQL database cluster
- **Vite/React Build** - Static assets seamlessly served via robust hosting

### Deployment
- **Vercel**
- **Render** 
- **GitHub Actions** - CI/CD workflows

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Gmail account (for OTP functionality)

### Clone Repository
```bash
git clone https://github.com/nikhil2004-blip/whack25deploy.git
cd whack25deploy
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add Firebase credentials to .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001

# Run development server
npm run dev
```

### Backend Setup (OTP Server)
```bash
cd otp-server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add Gmail credentials to .env
PORT=3001
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=random_secret_key

# Start server
npm start
```

### Firebase Configuration

1. Create Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication → Google Sign-In
3. Enable Firestore Database
4. Add `localhost:5173` to authorized domains
5. Copy configuration to `.env`

### Gmail App Password

1. Enable 2-Step Verification in Google Account
2. Generate App Password: [myaccount.google.com/security](https://myaccount.google.com/security)
3. Use 16-character password in `EMAIL_PASS`

---

## 🚀 Deployment

### Frontend (Vercel)

1. **Import Project**
   - Connect GitHub repository
   - Select `nikhil2004-blip/whack25deploy`

2. **Configure**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy** - Automatic deployments on git push

### Backend (Render)

1. **Create Web Service**
   - Repository: `nikhil2004-blip/whack25deploy`
   - Root Directory: `otp-server`

2. **Configure**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   PORT=3001
   NODE_ENV=production
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=https://your-app.vercel.app
   SESSION_SECRET=random_secret
   ```

4. **Deploy** - Copy URL and update Vercel `VITE_API_URL`

### Post-Deployment

1. **Update Firebase**
   - Add Vercel domain to authorized domains
   - Example: `your-app.vercel.app`

2. **Update Render**
   - Set `FRONTEND_URL` to Vercel URL
   - Redeploy service

3. **Test**
   - Google Sign-In
   - Email OTP
   - Game progression
   - Progress saving

---

## 🎯 How to Play

### Getting Started

1. **Visit**: [https://whack25deploy.vercel.app/]
2. **Sign In**: Choose Google or Email authentication
3. **Select Mission**: Start with Mangalyaan
4. **Read MRD**: Study the mission briefing
5. **Play Level**: Complete objectives
6. **Progress**: Unlock next levels

### Gameplay Tips

- **Read MRDs Carefully**: Each briefing contains crucial information
- **Watch Gauges**: Monitor fuel, velocity, altitude closely
- **Timing Matters**: Precision is key in space maneuvers
- **Learn from Failures**: Detailed feedback helps improve
- **Conserve Fuel**: You'll need it for later stages
- **Use Help**: "View MRD" button available in levels

### Controls

- **Mouse/Touch**: Click buttons and controls
- **Keyboard**: Some levels support arrow keys
- **Responsive**: Works on desktop and tablet

---

## 🎨 Special Features

### Dynamic Planet Rendering
- **3D Planets**: Real-time rendering with React Three Fiber
- **Texture Morphing**: Smooth transitions between celestial bodies
- **Synchronized Theme**: UI colors match current planet
- **Rotation Animation**: Realistic planetary motion

### Mission Completion System
- **Progress Tracking**: All progress saved to cloud
- **Completion Badges**: Visual indicators for finished levels
- **Mission Summary**: Detailed statistics and achievements
- **Next Mission Unlock**: Complete Mangalyaan to unlock Chandrayaan-3



### Educational Integration
- **Real Mission Data**: Actual stats from ISRO Mangalyaan
- **Physics Lessons**: Simplified orbital mechanics
- **Historical Facts**: India's space journey
- **Vocabulary Building**: Learn space terminology

---

## 📸 Screenshots

### Landing Page
<img width="1911" height="903" alt="image" src="https://github.com/user-attachments/assets/e17674d3-93a6-4b2d-aba0-bc3b6fbedd78" />


### Mission Selection
<img width="1905" height="910" alt="image" src="https://github.com/user-attachments/assets/5e10aa95-3b12-4d2d-a3eb-f49aec886e80" />


### Level Gameplay
<img width="1806" height="906" alt="image" src="https://github.com/user-attachments/assets/e5cf8376-9d14-43fa-9ee6-f15fc22b50b5" />


### Mission Complete
<img width="861" height="780" alt="image" src="https://github.com/user-attachments/assets/e19eb08d-5e12-460f-a2a4-ed992515c50a" />



---

## 🤝 Open Source & Contributions

Gyanyaan is an open-source project, and we actively welcome contributions from developers, designers, and space enthusiasts! Whether you want to add new missions, design 3D models, fix bugs, or improve the UI/UX, your help is appreciated.

### How to Contribute

1. **Fork the Repository**
   Click the "Fork" button at the top right of this repository to create your own personal copy.

2. **Clone your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gyanyaan.git
   cd gyanyaan
   ```

3. **Create a Development Branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

4. **Make your Changes**
   Follow the Installation guide to run the modern MERN frontend and backend locally to test your code. 

5. **Commit your Changes**
   ```bash
   git commit -m "feat: added an amazing new feature"
   ```

6. **Push to your Fork**
   ```bash
   git push origin feature/your-amazing-feature
   ```

7. **Open a Pull Request**
   Go to the original Gyanyaan repository, click the `Pull requests` tab, and click `New pull request`. Compare across forks to select your new branch and submit! Provide a clear description of what changed.

---

## 👥 Team

**team memmbers **
- NIKHIL KUMAR YADAV
- BHOJAK BHARGAV HEMEN 
- DHRUV AGRAWAL
- MANJIT MISHRA


---



## 🙏 Acknowledgments

- **ISRO** - For the inspiring Mangalyaan mission
- **React Community** - For excellent libraries and tools
- **Hackathon Organizers** - For the opportunity
- **Beta Testers** - For valuable feedback

---

## 📞 Contact

For questions, feedback, or collaboration:
- **GitHub**: [nikhil2004-blip](https://github.com/nikhil2004-blip)
- 
- **Demo**: [[Live URL]](https://whack25deploy.vercel.app/)

---

<div align="center">

**Made with ❤️ for space exploration education**

⭐ Star this repo if you found it interesting! ⭐

</div>
