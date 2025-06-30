# 🚀 Backend Deployment Guide

This guide will help you deploy the School Attendance Backend to production.

## 📋 Prerequisites

- Python 3.8 or higher
- pip
- Git
- Docker (optional, for containerized deployment)

## 🎯 Deployment Options

### Option 1: Direct Server Deployment

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd school_manage_attendance_app/backend
   ```

2. **Create Environment File**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

3. **Install Dependencies**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Start Production Server**
   ```bash
   chmod +x start_production.sh
   ./start_production.sh
   ```

### Option 2: Docker Deployment

1. **Build and Run with Docker**
   ```bash
   cd backend
   docker build -t school-attendance-backend .
   docker run -p 8000:8000 --env-file .env school-attendance-backend
   ```

2. **Using Docker Compose**
   ```bash
   cd backend
   docker-compose up -d
   ```

### Option 3: Cloud Platform Deployment

#### Heroku
1. Create `Procfile`:
   ```
   web: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set FRONTEND_URL=https://your-frontend-url.com
   git push heroku main
   ```

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Render
1. Connect your GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
4. Set environment variables

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```env
# Required: Your frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Additional allowed origins
ADDITIONAL_ORIGINS=https://www.your-domain.com,https://app.your-domain.com

# Optional: Database URL (if using real database)
DATABASE_URL=sqlite:///./school_attendance.db

# Optional: JWT Secret Key
SECRET_KEY=your-super-secret-jwt-key-here

# Optional: Server configuration
HOST=0.0.0.0
PORT=8000
```

## 🔒 Security Considerations

1. **Generate a Strong Secret Key**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use HTTPS in Production**
   - Set up SSL certificates
   - Configure reverse proxy (nginx)

3. **Environment Variables**
   - Never commit `.env` files
   - Use secure environment variable management

4. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

## 📊 Monitoring and Logging

### Health Check Endpoint
The API includes a health check at `/`:
```bash
curl http://your-backend-url/
```

### Logging
Enable structured logging:
```bash
export LOG_LEVEL=info
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` in environment
   - Verify frontend URL is in allowed origins

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing process: `lsof -ti:8000 | xargs kill`

3. **Permission Errors**
   - Check file permissions
   - Run with appropriate user

4. **Dependencies Issues**
   - Update pip: `pip install --upgrade pip`
   - Clear cache: `pip cache purge`

### Debug Mode
For debugging, run in development mode:
```bash
python main.py
```

## 📈 Performance Optimization

1. **Worker Processes**
   - Adjust worker count based on CPU cores
   - Monitor memory usage

2. **Database Optimization**
   - Use connection pooling
   - Implement caching

3. **Static Files**
   - Serve static files through nginx
   - Enable compression

## 🔄 Updates and Maintenance

1. **Regular Updates**
   ```bash
   git pull origin main
   pip install -r requirements.txt
   ```

2. **Database Migrations**
   - Backup before updates
   - Test migrations in staging

3. **Monitoring**
   - Set up uptime monitoring
   - Monitor error rates
   - Track API response times

## 📞 Support

For deployment issues:
1. Check logs: `docker logs <container-id>`
2. Verify environment variables
3. Test endpoints manually
4. Check network connectivity

## 🎉 Success Checklist

- [ ] Backend is accessible at your domain
- [ ] CORS is properly configured
- [ ] Health check endpoint responds
- [ ] Frontend can connect to backend
- [ ] SSL certificate is installed (if using HTTPS)
- [ ] Environment variables are set
- [ ] Monitoring is configured
- [ ] Backups are scheduled 