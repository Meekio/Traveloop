-- Traveloop Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth handles this, but we can extend it)
-- Note: Supabase creates auth.users automatically
-- We'll reference auth.users(id) in our tables

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2),
  preferences JSONB,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (start_date <= end_date),
  CONSTRAINT valid_budget CHECK (budget >= 0)
);

-- Stops table (cities in the itinerary)
CREATE TABLE stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_stop_dates CHECK (arrival_date <= departure_date)
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_cost CHECK (estimated_cost >= 0),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Budget items table
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_amount CHECK (amount >= 0)
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  task VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared trips table
CREATE TABLE shared_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_stops_trip_id ON stops(trip_id);
CREATE INDEX idx_stops_order ON stops(trip_id, order_index);
CREATE INDEX idx_activities_stop_id ON activities(stop_id);
CREATE INDEX idx_budget_items_trip_id ON budget_items(trip_id);
CREATE INDEX idx_notes_trip_id ON notes(trip_id);
CREATE INDEX idx_checklist_trip_id ON checklist_items(trip_id);
CREATE INDEX idx_shared_trips_token ON shared_trips(share_token);
CREATE INDEX idx_shared_trips_trip_id ON shared_trips(trip_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "Users can view their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Stops policies
CREATE POLICY "Users can view stops of their trips" ON stops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = stops.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stops for their trips" ON stops
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = stops.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stops of their trips" ON stops
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = stops.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stops of their trips" ON stops
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = stops.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Activities policies
CREATE POLICY "Users can view activities of their trips" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stops 
      JOIN trips ON trips.id = stops.trip_id 
      WHERE stops.id = activities.stop_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activities for their trips" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stops 
      JOIN trips ON trips.id = stops.trip_id 
      WHERE stops.id = activities.stop_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities of their trips" ON activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stops 
      JOIN trips ON trips.id = stops.trip_id 
      WHERE stops.id = activities.stop_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities of their trips" ON activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM stops 
      JOIN trips ON trips.id = stops.trip_id 
      WHERE stops.id = activities.stop_id AND trips.user_id = auth.uid()
    )
  );

-- Budget items policies
CREATE POLICY "Users can manage budget items of their trips" ON budget_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = budget_items.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can manage notes of their trips" ON notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = notes.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Checklist policies
CREATE POLICY "Users can manage checklist items of their trips" ON checklist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = checklist_items.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Shared trips policies
CREATE POLICY "Users can manage shared trips" ON shared_trips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = shared_trips.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Public access to shared trips (for viewing)
CREATE POLICY "Anyone can view active shared trips" ON shared_trips
  FOR SELECT USING (is_active = TRUE);
