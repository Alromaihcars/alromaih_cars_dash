# 🚀 AlRomaih Cars Dashboard - Coolify Deployment Guide

## 📋 Prerequisites

✅ **Coolify Installed**: Access your Coolify dashboard at `http://YOUR_SERVER_IP:8000`  
✅ **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)  
✅ **Environment Variables**: Ready to configure  

## 🔧 Step-by-Step Deployment

### 1. **Access Coolify Dashboard**

Navigate to: `http://92.112.192.192:8000`

**First Time Setup:**
- Register your admin account
- Complete initial configuration
- Add your server (localhost should be auto-detected)

### 2. **Create New Project**

1. Click **"Create New Resource"**
2. Select **"Application"**
3. Choose **"Public Repository"** or **"Private Repository"**

### 3. **Repository Configuration**

**Repository URL**: `YOUR_GIT_REPOSITORY_URL`  
**Branch**: `main` or your deployment branch  
**Build Pack**: **Dockerfile** (since we created one)

### 4. **Environment Variables**

Configure these essential environment variables:

```env
# Required - GraphQL API
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://portal.alromaihcars.com/graphql
API_KEY=your-secure-api-key-here

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# CORS Configuration
NEXT_PUBLIC_CORS_ENABLED=true
NEXT_PUBLIC_ALLOWED_ORIGINS=https://your-domain.com

# API Settings
NEXT_PUBLIC_REQUEST_TIMEOUT=30000
NEXT_PUBLIC_RETRY_ATTEMPTS=3
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_CACHE_TTL=300000

# Production Settings
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_DEBUG_API=false
```

### 5. **Build Configuration**

**Dockerfile Path**: `./Dockerfile` (root of repository)  
**Build Command**: Auto-detected from Dockerfile  
**Port**: `3000` (already configured in Dockerfile)  

### 6. **Domain Configuration**

1. **Subdomain**: Choose a subdomain (e.g., `dashboard.your-domain.com`)
2. **SSL**: Enable automatic SSL certificate
3. **Custom Domain**: Add your custom domain if desired

### 7. **Deploy**

1. Click **"Deploy"**
2. Monitor the build logs
3. Wait for deployment to complete

## 🔍 Troubleshooting

### Build Issues

**Dependency Conflicts:**
- The `.npmrc` file handles React version conflicts
- Build uses `--legacy-peer-deps` flag

**Memory Issues:**
- Increase server resources if build fails
- Consider using multi-stage build optimization

### Runtime Issues

**API Connection:**
- Verify `NEXT_PUBLIC_GRAPHQL_ENDPOINT` is correct
- Check `API_KEY` is properly set (server-side only)
- Ensure CORS settings allow your domain

**Performance:**
- Enable Redis caching in Coolify
- Configure CDN if needed
- Monitor resource usage

## 📊 Monitoring

**Coolify Provides:**
- Real-time logs
- Resource monitoring
- Automatic restarts
- Health checks

**Application Monitoring:**
- Next.js built-in analytics
- Custom error tracking
- Performance metrics

## 🔐 Security Checklist

- [ ] **API Keys**: Never expose in client-side code
- [ ] **HTTPS**: Always use SSL in production
- [ ] **CORS**: Restrict to your domains only
- [ ] **Headers**: Security headers configured in `next.config.mjs`
- [ ] **Environment**: Separate dev/staging/prod environments

## 🔄 Updates & Maintenance

**Automatic Deployments:**
1. Configure webhook in your Git repository
2. Enable auto-deploy on push in Coolify
3. Set up staging environment for testing

**Manual Deployments:**
1. Push changes to your Git repository
2. Trigger deployment in Coolify dashboard
3. Monitor build and deployment logs

## 📱 Access Your Dashboard

After successful deployment:

**URL**: `https://your-subdomain.your-domain.com`  
**Admin Login**: Configure through your Odoo backend  
**Features**: Full dashboard functionality  

## 🆘 Support

**Issues with:**
- **Coolify**: Check Coolify documentation
- **Build**: Review Docker logs in Coolify
- **Application**: Check Next.js application logs
- **API**: Verify Odoo GraphQL endpoint

## 🚀 Production Optimization

**Performance:**
- Enable caching strategies
- Configure CDN
- Optimize images
- Monitor Core Web Vitals

**Scaling:**
- Use Coolify's scaling features
- Consider database optimization
- Monitor server resources

---

**🎉 Your AlRomaih Cars Dashboard is now ready for production!** 