@echo off
echo 🚀 Project IO MVP - JSON Database Migration
echo ==========================================

echo.
echo Step 1: Running migration from HTML files to JSON database...
node migrate-to-json.js

echo.
echo Step 2: Building website from database...
node build-json.js build

echo.
echo Step 3: Listing database contents...
node build-json.js list

echo.
echo ✅ Migration completed! 
echo.
echo 📝 Next steps:
echo    - Open index.html to test the migrated website
echo    - Use "node build-json.js add 'prompt'" to create new pages
echo    - Use "node build-json.js list" to see all pages
echo.
pause