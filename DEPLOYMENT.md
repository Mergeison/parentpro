# 🚀 Complete Deployment Guide

This guide will help you deploy both the frontend and backend of the School Attendance Management System to production.

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git
- A domain name (optional but recommended)
- SSL certificate (for HTTPS)

## 🎯 Quick Start

### 1. Backend Deployment

#### Option A: Heroku (Recommended for beginners)

1. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-school-attendance-backend
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   heroku config:set SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

#### Option B: Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Option C: Render

1. Connect your GitHub repository to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
4. Set environment variables

### 2. Frontend Deployment

#### Option A: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Set Environment Variables**
   ```
   REACT_APP_API_MODE=real
   REACT_APP_BACKEND_URL=https://your-backend-url.com/api
   ```

3. **Deploy**
   - Vercel will automatically deploy on push

#### Option B: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Import your GitHub repository

2. **Set Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add the same variables as above

#### Option C: GitHub Pages

1. **Update package.json**
   ```json
   {
     "homepage": "https://your-username.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Required: Your frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Additional allowed origins
ADDITIONAL_ORIGINS=https://www.your-domain.com

# Optional: JWT Secret Key
SECRET_KEY=your-super-secret-jwt-key-here

# Optional: Server configuration
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_MODE=real
REACT_APP_BACKEND_URL=https://your-backend-url.com/api
REACT_APP_API_ENABLED=true

# App Configuration
REACT_APP_NAME=School Attendance Management
REACT_APP_VERSION=2.0.0
```

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Update Backend CORS**
   - The backend is already configured to accept environment variables
   - Make sure your frontend URL is set in `FRONTEND_URL`

2. **Update Frontend API Configuration**
   - The frontend is configured to switch between mock and real API
   - Set `REACT_APP_API_MODE=real` for production

3. **Test Locally**
   ```bash
   # Backend
   cd backend
   python main.py
   
   # Frontend (in another terminal)
   npm start
   ```

### Step 2: Deploy Backend

1. **Choose a Platform**
   - Heroku: Easy, free tier available
   - Railway: Simple, good free tier
   - Render: Good performance, free tier
   - DigitalOcean: More control, paid

2. **Deploy**
   ```bash
   cd backend
   # Follow platform-specific instructions above
   ```

3. **Test Backend**
   ```bash
   curl https://your-backend-url.com/
   # Should return: {"message": "Multi-School Attendance API", "version": "2.0.0"}
   ```

### Step 3: Deploy Frontend

1. **Choose a Platform**
   - Vercel: Best for React apps, excellent performance
   - Netlify: Good, easy to use
   - GitHub Pages: Free, simple

2. **Set Environment Variables**
   - `REACT_APP_API_MODE=real`
   - `REACT_APP_BACKEND_URL=https://your-backend-url.com/api`

3. **Deploy**
   - Follow platform-specific instructions above

### Step 4: Configure Domain (Optional)

1. **Buy a Domain**
   - Namecheap, GoDaddy, Google Domains

2. **Configure DNS**
   - Point to your hosting provider

3. **Set up SSL**
   - Most platforms provide free SSL certificates

## 🔒 Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] Strong JWT secret key generated
- [ ] CORS properly configured
- [ ] Environment variables not committed to git
- [ ] API rate limiting configured (if needed)
- [ ] Database backups scheduled (if using real database)

## 📊 Monitoring Setup

### Backend Health Check
```bash
curl https://your-backend-url.com/
```

### Frontend Health Check
- Visit your frontend URL
- Check browser console for errors

### Uptime Monitoring
- UptimeRobot (free)
- Pingdom
- StatusCake

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Access to fetch at 'https://backend-url.com/api/login' from origin 'https://frontend-url.com' has been blocked by CORS policy
   ```
   **Solution**: Check `FRONTEND_URL` in backend environment variables

2. **API Connection Failed**
   ```
   Failed to fetch
   ```
   **Solution**: 
   - Verify backend URL is correct
   - Check if backend is running
   - Verify CORS configuration

3. **Build Failures**
   ```
   Build failed
   ```
   **Solution**:
   - Check environment variables
   - Verify all dependencies are installed
   - Check for syntax errors

4. **Authentication Issues**
   ```
   401 Unauthorized
   ```
   **Solution**:
   - Check JWT token in localStorage
   - Verify token format
   - Check backend authentication logic

### Debug Mode

For debugging, set these environment variables:

**Backend:**
```bash
export LOG_LEVEL=debug
export ENVIRONMENT=development
```

**Frontend:**
```env
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_API_MODE=mock
```

## 📈 Performance Optimization

### Backend
- Use gunicorn with multiple workers
- Enable compression
- Use CDN for static files
- Implement caching

### Frontend
- Enable code splitting
- Optimize images
- Use CDN for assets
- Enable service worker

## 🔄 Updates and Maintenance

### Regular Updates
1. **Backend**
   ```bash
   git pull origin main
   pip install -r requirements.txt
   # Restart server
   ```

2. **Frontend**
   ```bash
   git pull origin main
   npm install
   npm run build
   # Redeploy
   ```

### Database Migrations
- Always backup before updates
- Test migrations in staging
- Use version control for schema changes

## 📞 Support

### Getting Help
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check application logs
4. Test endpoints manually

### Useful Commands
```bash
# Check backend status
curl -I https://your-backend-url.com/

# Check frontend build
npm run build

# Test API locally
curl http://localhost:8000/api/schools

# Check environment variables
echo $FRONTEND_URL
```

## 🎉 Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS properly configured
- [ ] Authentication working
- [ ] All features functional
- [ ] HTTPS enabled
- [ ] Domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Backups scheduled
- [ ] Documentation updated

## 🚀 Next Steps

1. **Set up monitoring and alerts**
2. **Configure automated backups**
3. **Set up CI/CD pipeline**
4. **Add analytics and tracking**
5. **Plan for scaling**
6. **Set up staging environment**

---

**Need help?** Check the troubleshooting section or create an issue in the repository. 