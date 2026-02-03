@echo off
REM Analytics Dashboard Setup Script for Windows

echo 🚀 Starting Analytics Dashboard Setup...

REM Navigate to Django project
cd "Pageantry\PageantryVoting"

echo 📦 Creating migrations for Analytics app...
python manage.py makemigrations Analytics

echo 🔄 Running migrations...
python manage.py migrate Analytics

echo ✅ Migrations complete!

echo.
echo 📊 Analytics Dashboard Setup Complete!
echo.
echo Next steps:
echo 1. Start Django server: python manage.py runserver
echo 2. In another terminal: cd ..\front_end && npm run dev
echo 3. Navigate to: http://localhost:5173/dashboard/analytics/EVENT_ID
echo.
echo Don't forget to:
echo - Replace EVENT_ID with an actual event ID
echo - Ensure you're logged in as the event creator
echo - Have some votes in the system to see data
echo.
pause
