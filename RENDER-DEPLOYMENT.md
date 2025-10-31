# Render Deployment Guide for Control Panel

## Environment Variables Setup

Create a `.env` file in the root of the Control Panel directory with the following:

```env
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

**Important:** Replace `https://your-backend-url.onrender.com` with your actual Render backend URL.

## Deploying to Render

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file
4. In the Render dashboard, add the environment variable:
   - Go to your service settings
   - Navigate to "Environment"
   - Add `VITE_BACKEND_URL` with your backend URL
   - Example: `https://your-backend.onrender.com`

### Option 2: Manual Configuration

1. Create a new **Static Site** service in Render
2. Connect your GitHub repository
3. Configure the following:
   - **Name:** control-panel (or your preferred name)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     - `VITE_BACKEND_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

### Important Notes

- Vite requires environment variables to be prefixed with `VITE_` to be accessible in the browser
- The `VITE_BACKEND_URL` must be set as an environment variable in Render's dashboard
- After setting environment variables, Render will rebuild your application
- Make sure your backend CORS settings allow requests from your Render frontend URL

## Local Development

For local development, create a `.env` file in the Control Panel root:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Then run:
```bash
npm install
npm run dev
```

## Build and Preview

To build and preview locally:
```bash
npm run build
npm run preview
```

