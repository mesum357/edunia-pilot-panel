# Quick Fix for Control Panel Connection Issues

## Problem

You're seeing errors like:
```
localhost:3000/api/admin/payment-requests?page=1&limit=20:1  
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

This means the Control Panel is trying to connect to `localhost:3000` but the backend is not running there.

## Immediate Fix

### Option 1: Connect to Render Backend (Recommended)

1. **Create a `.env` file** in the `Control Panel/` directory:
   ```env
   VITE_BACKEND_URL=https://nexusbackend-5b8b.onrender.com
   ```
   ⚠️ **Replace with your actual Render backend URL!**

2. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

3. **Check browser console** - you should see:
   ```
   🌐 Control Panel Backend URL: https://nexusbackend-5b8b.onrender.com
   ```

### Option 2: Run Backend Locally

1. **Start the backend** on `localhost:3000`
2. The Control Panel will automatically use it (no .env needed)

## Finding Your Backend URL

- **Render Dashboard** → Your Backend Service → Look at the URL (e.g., `https://nexusbackend-5b8b.onrender.com`)
- **Or check** `NexusBackend/` deployment logs

## After Fixing

Once you've set the `.env` file and restarted:
- ✅ No more `ERR_CONNECTION_REFUSED` errors
- ✅ API calls should work
- ✅ Dashboard should load data

## Need Help?

Check `Control Panel/ENV-SETUP.md` for detailed instructions.

