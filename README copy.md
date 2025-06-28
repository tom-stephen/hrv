# HRV Tracker

A mobile-first web app for tracking Heart Rate Variability (HRV) for athletes.

## Features

- User authentication (athletes and coaches)
- HRV data upload and analysis
- Readiness indicators (green/yellow/red)
- HRV graphs with selectable time ranges
- Coach dashboard to view athlete readiness
- Email-based HRV file processing

## Deployment on Railway

### Prerequisites

1. Railway account
2. PostgreSQL database on Railway
3. GitHub repository

### Setup

1. **Connect to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Create new project
   - Connect your GitHub repository

2. **Environment Variables:**
   ```
   DATABASE_URL=your_railway_postgresql_url
   JWT_SECRET=your_random_secret_key
   NODE_ENV=production
   ```

3. **Deploy:**
   - Railway will automatically build and deploy
   - The app will be available at your Railway URL

### Email Setup (Optional)

To enable email-based HRV uploads:

1. **SendGrid Setup:**
   - Create SendGrid account
   - Go to Settings → Inbound Parse
   - Add host: `hrv.your-app-name.railway.app`
   - Set URL: `https://your-app-name.railway.app/api/hrv/email-webhook`

2. **Test:**
   - Athletes can email HRV files to: `hrv@your-app-name.railway.app`

## Local Development

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/hrv/upload` - File upload
- `POST /api/hrv/email-webhook` - Email processing
- `GET /api/hrv/records/:userId` - Get HRV records
- `GET /api/hrv/latest/:userId` - Get latest HRV record 