#!/bin/bash
set -e

echo "🎄 Wishlist App Setup"
echo "===================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and set your admin credentials:"
    echo "   ADMIN_USERNAME=your-username"
    echo "   ADMIN_PASSWORD=your-secure-password"
    echo ""
    read -p "Press Enter when you've updated .env, or Ctrl+C to exit..."
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for app to start..."
sleep 5

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Your wishlist app is ready at: http://localhost:3001"
echo "🔑 Admin login: http://localhost:3001/admin/login"
echo ""
echo "Sample wishlists have been created automatically:"
echo "  • Dad's Wishlist: http://localhost:3001/dads-wishlist"
echo "  • Mom's Wishlist: http://localhost:3001/moms-wishlist"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
