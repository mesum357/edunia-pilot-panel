# Environment Variables Setup

## Quick Fix for Connection Errors

If you're seeing `ERR_CONNECTION_REFUSED` errors, the Control Panel is trying to connect to `localhost:3000` but the backend is not running locally.

### Solution 1: Use Render Backend (Recommended)

Create a `.env` file in the root of the Control Panel directory:

```env
VITE_BACKEND_URL=https://nexusbackend-5b8b.onrender.com
```

**Replace `https://nexusbackend-5b8b.onrender.com` with your actual Render backend URL.**

### Solution 2: Run Backend Locally

If you want to run the backend locally:
1. Start the backend on `http://localhost:3000`
2. The Control Panel will automatically use `localhost:3000` as the default

## Step-by-Step Setup

### For Local Development

1. **Create `.env` file** in `Control Panel/` directory:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

2. **Make sure backend is running** on port 3000

3. **Restart the Control Panel dev server**:
   ```bash
   npm run dev
   ```

### For Production (Render)

1. **In Render Dashboard:**
   - Go to your Control Panel service
   - Navigate to **Environment** tab
   - Add environment variable:
     - **Key:** `VITE_BACKEND_URL`
     - **Value:** `https://nexusbackend-5b8b.onrender.com` (your backend URL)

2. **Render will automatically rebuild** after adding the variable

## Example .env File

### Local Development (Backend on localhost:3000)
```env
VITE_BACKEND_URL=http://localhost:3000
```

### Local Development (Backend on Render)
```env
VITE_BACKEND_URL=https://nexusbackend-5b8b.onrender.com
```

### Production
Set in Render dashboard (don't use .env file for production deployments)

## Important Notes

- The `.env` file is already in `.gitignore` and will not be committed to Git
- Vite requires environment variables to be prefixed with `VITE_` to be accessible in the browser
- After creating or updating the `.env` file, **restart your development server**
- Check browser console for the backend URL being used:
  - `🌐 Control Panel Backend URL: ...` - Shows the URL being used
  - `⚠️ VITE_BACKEND_URL not set` - Means you need to create the .env file

## Troubleshooting

### Error: `ERR_CONNECTION_REFUSED`
- Backend is not running on `localhost:3000`
- Solution: Either start the backend locally OR create `.env` file with Render backend URL

### Error: `CORS policy` errors
- Backend CORS not configured for your Control Panel URL
- Solution: Make sure backend allows your Control Panel URL (see `NexusBackend/CORS-FIX.md`)

### Backend URL not updating
- Restart the dev server after creating/updating `.env` file
- Clear browser cache if needed

