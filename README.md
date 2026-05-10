# Traveloop

Smart travel planning platform with AI-powered itinerary generation for hackathon.

## 📦 Repository Structure

This repository contains both the **frontend** and **backend** components of Traveloop:

- **Frontend**: React Native mobile application (coming soon)
- **Backend**: Express.js REST API (current implementation)

---

## 🖥️ Backend Setup

### 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# See SETUP.md for detailed instructions
```

### 3. Create Database Tables
- Go to your Supabase dashboard → SQL Editor
- Copy and run the contents of `database/schema.sql`

### 4. Start Server
```bash
npm run dev
```

You should see:
```
✅ All required environment variables are set
🚀 Traveloop Backend running on port 3000
```

### 5. Test It Works
```bash
# In another terminal
node test-api.js
```

### 📚 Full Backend Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- How to get Supabase credentials
- How to get API keys (Gemini, OpenWeather, etc.)
- Troubleshooting common issues

---

## 📱 Frontend Setup

### Prerequisites
- Node.js (v16 or higher)
- React Native development environment
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to frontend directory (when available)
cd frontend

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
API_BASE_URL=http://localhost:3000
# Or your deployed backend URL
# API_BASE_URL=https://your-backend.onrender.com
```

### Frontend Features
- 📱 **Native Mobile Experience** - Built with React Native
- 🎨 **Modern UI/UX** - Intuitive and beautiful interface
- 🔐 **Secure Authentication** - Login/Signup with Supabase
- 🗺️ **Interactive Trip Planning** - Visual trip builder
- 📍 **Map Integration** - View destinations and activities on map
- 💰 **Budget Management** - Track expenses on the go
- 🤖 **AI Suggestions** - Get AI-generated itineraries
- 🌤️ **Weather Integration** - Real-time weather for destinations
- 🔗 **Share Trips** - Share your plans with friends

---

## ✨ Features

- 🔐 **Authentication** - Secure signup/login with Supabase Auth
- 🗺️ **Multi-city Trips** - Plan trips with multiple destinations
- 📍 **Activities** - Add and manage activities at each stop
- 💰 **Budget Tracking** - Track expenses by category
- 🤖 **AI Itinerary** - Generate complete itineraries with Gemini AI
- 🌤️ **Weather** - Get weather forecasts for destinations
- 🔗 **Trip Sharing** - Share trips via public links
- 📝 **Notes & Checklists** - Keep track of important info

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **External APIs**: 
  - Gemini AI (itinerary generation)
  - OpenWeatherMap (weather)
  - GeoDB/Teleport (city search)
  - Google Places (activity discovery)

### Frontend (Coming Soon)
- **Framework**: React Native
- **State Management**: Redux / Context API
- **Navigation**: React Navigation
- **Maps**: React Native Maps
- **UI Components**: React Native Paper / Native Base
- **HTTP Client**: Axios

## 📡 API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /version` - API version

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Trips
- `POST /trips` - Create trip
- `GET /trips` - List user's trips
- `GET /trips/:id` - Get trip details
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip

### Stops (Cities in itinerary)
- `POST /trips/:tripId/stops` - Add stop
- `GET /trips/:tripId/stops` - List stops
- `PUT /stops/reorder` - Reorder stops
- `PUT /stops/:id` - Update stop
- `DELETE /stops/:id` - Delete stop

### Activities
- `POST /stops/:stopId/activities` - Add activity
- `GET /stops/:stopId/activities` - List activities
- `PUT /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity

### Budget
- `POST /trips/:tripId/budget` - Add budget item
- `GET /trips/:tripId/budget` - Get budget summary
- `PUT /budget/:id` - Update budget item
- `DELETE /budget/:id` - Delete budget item

### Notes & Checklist
- `POST /trips/:tripId/notes` - Add note
- `POST /trips/:tripId/checklist` - Add checklist item
- (Update and delete endpoints available)

### External APIs
- `GET /search/cities?q=tokyo` - Search cities
- `GET /weather?lat=35.6762&lon=139.6503` - Get weather
- `GET /search/activities?lat=35.6762&lon=139.6503&category=restaurants` - Search activities

### AI Features
- `POST /trips/generate` - Generate AI itinerary

### Sharing
- `POST /trips/:id/share` - Generate share link
- `GET /shared/:shareToken` - View shared trip (public)
- `DELETE /trips/:id/share` - Deactivate share link

## 🧪 Testing

```bash
# Start the server
npm run dev

# In another terminal, run tests
node test-api.js
```

## 📁 Project Structure

```
traveloop/
├── backend/             # Backend API (current)
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── env.js       # Environment validation
│   │   │   └── supabase.js  # Supabase client
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── database/
│   │   └── schema.sql       # Database schema
│   ├── .env.example
│   └── package.json
│
├── frontend/            # React Native app (coming soon)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── screens/         # App screens
│   │   ├── navigation/      # Navigation setup
│   │   ├── services/        # API calls
│   │   ├── store/           # State management
│   │   ├── utils/           # Helper functions
│   │   └── App.js           # App entry point
│   ├── assets/              # Images, fonts, etc.
│   └── package.json
│
└── README.md            # This file
```

## 🚢 Deployment

### Backend Deployment

#### Option 1: Render
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service
4. Connect your repo
5. Add environment variables
6. Deploy!

#### Option 2: Railway
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variables
5. Deploy!

#### Option 3: Fly.io
```bash
fly launch
fly secrets set SUPABASE_URL=...
fly deploy
```

### Frontend Deployment

#### Option 1: Expo (Recommended for React Native)
```bash
# Install Expo CLI
npm install -g expo-cli

# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

#### Option 2: App Store / Google Play
- Follow React Native's official deployment guides
- iOS: [React Native iOS Deployment](https://reactnative.dev/docs/publishing-to-app-store)
- Android: [React Native Android Deployment](https://reactnative.dev/docs/signed-apk-android)

## 🐛 Troubleshooting

### Backend Issues

#### Server won't start
- Check `.env` file exists and has Supabase credentials
- Run `npm install` to ensure dependencies are installed

#### Database errors
- Make sure you ran `database/schema.sql` in Supabase SQL Editor
- Check Supabase project is active

#### Authentication errors
- Verify `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase Auth is enabled in dashboard

### Frontend Issues

#### Metro bundler errors
- Clear cache: `npm start -- --reset-cache`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

#### iOS build issues
- Clean build folder in Xcode
- Reinstall pods: `cd ios && pod deintegrate && pod install`

#### Android build issues
- Clean gradle: `cd android && ./gradlew clean`
- Check Android SDK is properly installed

## 📝 Development

### Backend Development
```bash
# Start with auto-reload
npm run dev

# Start production
npm start
```

### Frontend Development
```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test
```

## 🎯 Hackathon Tips

### Backend (Completed ✅)
1. ✅ Auth (signup/login)
2. ✅ Create trip
3. ✅ Add stops (cities)
4. ✅ Add activities
5. ✅ AI itinerary generation
6. ✅ Share trip
7. ✅ Budget tracking
8. ✅ Notes/Checklist

### Frontend (Priority for Demo)
1. 🎯 Auth screens (login/signup)
2. 🎯 Trip list and creation
3. 🎯 Trip details with stops
4. 🎯 Activity management
5. 🎯 AI itinerary generation UI
6. 🎯 Basic map view

**Can skip if time is tight:**
- Advanced animations
- Offline mode
- Push notifications
- Complex map interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT

## 👥 Team

Built for hackathon by the Traveloop team - Meenakshi, Ishana

## 📧 Contact

For questions or support, please open an issue on GitHub.
