# Environment Variables Setup

## Creating .env File

Create a `.env` file in the root of the Control Panel directory with the following content:

```env
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

**Replace the URL with your actual backend URL:**

- For local development: `http://localhost:3000`
- For production: Your Render backend URL (e.g., `https://your-backend.onrender.com`)

## Example .env File

```env
# Backend API URL
VITE_BACKEND_URL=https://nexus-backend.onrender.com
```

## Important Notes

- The `.env` file is already in `.gitignore` and will not be committed to Git
- Vite requires environment variables to be prefixed with `VITE_` to be accessible in the browser
- After creating or updating the `.env` file, restart your development server

