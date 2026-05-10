# Traveloop Backend

Smart travel planning platform backend with AI-powered itinerary generation for hackathon.

## 🚀 Quick Start (5 minutes)

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

## 📚 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- How to get Supabase credentials
- How to get API keys (Gemini, OpenWeather, etc.)
- Troubleshooting common issues

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

- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **External APIs**: 
  - Gemini AI (itinerary generation)
  - OpenWeatherMap (weather)
  - GeoDB/Teleport (city search)
  - Google Places (activity discovery)

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
traveloop-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.js       # Environment validation
│   │   └── supabase.js  # Supabase client
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── tripController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   └── tripRoutes.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── database/
│   └── schema.sql       # Database schema
├── .env.example         # Environment template
├── package.json
├── SETUP.md            # Detailed setup guide
└── README.md           # This file
```

## 🚢 Deployment

### Option 1: Render
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service
4. Connect your repo
5. Add environment variables
6. Deploy!

### Option 2: Railway
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variables
5. Deploy!

### Option 3: Fly.io
```bash
fly launch
fly secrets set SUPABASE_URL=...
fly deploy
```

## 🐛 Troubleshooting

### Server won't start
- Check `.env` file exists and has Supabase credentials
- Run `npm install` to ensure dependencies are installed

### Database errors
- Make sure you ran `database/schema.sql` in Supabase SQL Editor
- Check Supabase project is active

### Authentication errors
- Verify `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase Auth is enabled in dashboard

## 📝 Development

```bash
# Start with auto-reload
npm run dev

# Start production
npm start
```

## 🎯 Hackathon Tips

**Priority features for demo:**
1. ✅ Auth (signup/login)
2. ✅ Create trip
3. ✅ Add stops (cities)
4. ✅ Add activities
5. ✅ AI itinerary generation
6. ✅ Share trip

**Can skip if time is tight:**
- Budget calculations
- Notes/Checklist
- Advanced validation

## 📄 License

MIT
