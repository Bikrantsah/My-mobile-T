#!/bin/bash

echo "Setting up Movie Distribution Platform..."

# Install dependencies (equivalent to pip install -r requirements.txt)
echo "Installing dependencies..."
npm install

# Create environment file
if [ ! -f .env.local ]; then
    echo "Creating environment file..."
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_API_KEY=your_ai_api_key
EOL
    echo "Please update .env.local with your actual Supabase credentials"
fi

# Run migrations (equivalent to python manage.py migrate)
echo "Running database migrations..."
npm run migrate

# Create superuser
echo "Creating superuser..."
npm run createsuperuser admin@example.com admin123

echo "Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To start the AI service:"
echo "  npm run ai-service"
echo ""
echo "Available management commands:"
echo "  npm run migrate          - Run database migrations"
echo "  npm run makemigrations   - Create new migration files"
echo "  npm run shell           - Interactive database shell"
echo "  npm run createsuperuser - Create admin user"
