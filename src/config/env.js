import dotenv from 'dotenv';

dotenv.config();

// Only require Supabase for basic functionality
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Optional but recommended
const optionalEnvVars = [
  'GEMINI_API_KEY',
  'OPENWEATHER_API_KEY',
  'GEODB_API_KEY',
  'GOOGLE_PLACES_API_KEY'
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📝 Please copy .env.example to .env and fill in the required values');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  
  // Check optional variables
  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.log('⚠️  Optional API keys not set (some features will be limited):');
    missingOptional.forEach(varName => console.log(`   - ${varName}`));
  }
}

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiVersion: process.env.API_VERSION || '1.0.0',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  apis: {
    geodb: process.env.GEODB_API_KEY,
    openweather: process.env.OPENWEATHER_API_KEY,
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY,
    gemini: process.env.GEMINI_API_KEY
  }
};
