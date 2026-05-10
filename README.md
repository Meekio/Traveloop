# Traveloop

Smart travel planning platform with AI-powered itinerary generation for hackathon.

## 📦 Repository Structure

This repository contains both the **frontend** and **backend** components of Traveloop:

- **Frontend**: React web application ✅
- **Backend**: Express.js API layer + Supabase (Database & Auth) ✅

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

# Edit .env and add your credentials:
# - Supabase URL and keys
# - Gemini AI API key
# - OpenWeather API key
# - Google Places API key
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



## 📱 Frontend Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:3000
# Or your deployed backend URL
# REACT_APP_API_BASE_URL=https://your-backend.onrender.com

REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Frontend Features
- 🌐 **Responsive Web App** - Works on desktop and mobile browsers
- 🎨 **Modern UI/UX** - Intuitive and beautiful interface
- 🔐 **Secure Authentication** - Login/Signup with Supabase
- 🗺️ **Interactive Trip Planning** - Visual trip builder
- 📍 **Map Integration** - View destinations and activities on map
- 💰 **Budget Management** - Track expenses in real-time
- 🤖 **AI Suggestions** - Get AI-generated itineraries
- 🌤️ **Weather Integration** - Real-time weather for destinations
- 🔗 **Share Trips** - Share your plans with friends
- 📱 **Mobile Responsive** - Optimized for all screen sizes

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
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **External APIs**: 
  - Gemini AI (itinerary generation)
  - OpenWeatherMap (weather)
  - GeoDB/Teleport (city search)
  - Google Places (activity discovery)

### Frontend
- **Framework**: React
- **State Management**: Redux / Context API
- **Routing**: React Router
- **Maps**: Google Maps / Leaflet
- **UI Components**: Material-UI / Tailwind CSS
- **HTTP Client**: Axios
- **Backend**: Supabase (Database & Authentication)

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
├── backend/             # Express.js API Layer ✅
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── env.js       # Environment validation
│   │   │   └── supabase.js  # Supabase client setup
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic & external APIs
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── database/
│   │   └── schema.sql       # Supabase database schema
│   ├── .env.example
│   └── package.json
│
├── frontend/            # React web app ✅
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls to backend
│   │   ├── context/         # State management
│   │   ├── utils/           # Helper functions
│   │   ├── styles/          # CSS/styling
│   │   └── App.js           # App entry point
│   ├── public/              # Static assets
│   ├── .env.example
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

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Option 2: Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git
4. Connect your repo
5. Build command: `npm run build`
6. Publish directory: `build`
7. Add environment variables
8. Deploy!

#### Option 3: GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/traveloop"

# Deploy
npm run deploy
```

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

#### Build errors
- Clear cache: `npm start -- --reset-cache` or delete `.cache` folder
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build folder: `rm -rf build`

#### API connection issues
- Check `REACT_APP_API_BASE_URL` in `.env` file
- Ensure backend server is running
- Check CORS settings in backend

#### Map not loading
- Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set correctly
- Check API key has Maps JavaScript API enabled in Google Cloud Console

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
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## 🎯 Hackathon Tips

### Backend ✅
1. ✅ Auth (signup/login)
2. ✅ Create trip
3. ✅ Add stops (cities)
4. ✅ Add activities
5. ✅ AI itinerary generation
6. ✅ Share trip
7. ✅ Budget tracking
8. ✅ Notes/Checklist

### Frontend ✅
1. ✅ Auth screens (login/signup)
2. ✅ Trip list and creation
3. ✅ Trip details with stops
4. ✅ Activity management
5. ✅ AI itinerary generation UI
6. ✅ Interactive map view
7. ✅ Budget tracking UI
8. ✅ Responsive design

**Demo Flow:**
1. Sign up / Login
2. Create a new trip
3. Add destinations (stops)
4. Generate AI itinerary
5. View on map
6. Track budget
7. Share trip link

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
