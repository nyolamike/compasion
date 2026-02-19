# 🚀 Deployment Guide - Participant Self-Registration System

## Prerequisites

### Required Accounts
- ✅ Supabase account (already configured)
- ⚠️ Hosting provider account (choose one):
  - **Vercel** (Recommended - easiest)
  - **Netlify** (Alternative)
  - **AWS Amplify** (Enterprise option)

### Required Information
- Supabase URL
- Supabase Anon Key
- Email service credentials (if using custom email)

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Participant registration system complete"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Add Environment Variables
In Vercel dashboard, add these environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live at: `your-app.vercel.app`

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

**Total Time:** 15-20 minutes

---

## Option 2: Deploy to Netlify

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Participant registration system complete"
git push origin main
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### Step 3: Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Deploy
- Click "Deploy site"
- Wait 2-3 minutes
- Your app will be live at: `your-app.netlify.app`

**Total Time:** 15-20 minutes

---

## Environment Variables Reference

### Required Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Email Configuration (if using custom SMTP)
VITE_EMAIL_SERVICE=smtp
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_USER=your-email@domain.com
VITE_EMAIL_PASSWORD=your-app-password
```

### Where to Find Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## Post-Deployment Checklist

### Immediate Testing (5 minutes)
- [ ] Visit deployed URL
- [ ] Test login functionality
- [ ] Navigate to training sessions
- [ ] Generate a registration link
- [ ] Open registration link in incognito window
- [ ] Complete a test registration
- [ ] Verify email confirmation received
- [ ] Check registration appears in trainer dashboard
- [ ] Test report generation and export

### Security Verification (5 minutes)
- [ ] Verify HTTPS is enabled (lock icon in browser)
- [ ] Test invalid registration link handling
- [ ] Verify file upload size limits work
- [ ] Check duplicate registration prevention
- [ ] Test form validation

### Performance Check (5 minutes)
- [ ] Test page load speed (should be < 3 seconds)
- [ ] Test on mobile device
- [ ] Test file upload speed
- [ ] Check report generation speed

---

## Troubleshooting

### Issue: Build Fails
**Solution:**
```bash
# Test build locally first
npm run build

# If successful, commit and push
git add .
git commit -m "Fix build issues"
git push
```

### Issue: Environment Variables Not Working
**Solution:**
1. Verify variables are set in hosting dashboard
2. Ensure variable names start with `VITE_`
3. Redeploy after adding variables
4. Check browser console for errors

### Issue: Database Connection Fails
**Solution:**
1. Verify Supabase URL and key are correct
2. Check Supabase project is active
3. Verify database tables exist
4. Check Supabase dashboard for errors

### Issue: Email Not Sending
**Solution:**
1. Check email service credentials
2. Verify SMTP settings
3. Check Supabase Edge Functions are enabled
4. Review email service logs

### Issue: File Upload Fails
**Solution:**
1. Check Supabase Storage bucket exists
2. Verify storage policies allow uploads
3. Check file size limits (5MB max)
4. Verify file type restrictions

---

## Staging vs Production

### Staging Deployment (Recommended First)
1. Create a separate branch: `staging`
2. Deploy staging branch to: `staging.your-domain.com`
3. Use test data for validation
4. Invite team members to test
5. Fix any issues found

### Production Deployment
1. Merge staging to main after testing
2. Deploy main branch to: `your-domain.com`
3. Monitor for 24 hours
4. Have rollback plan ready

---

## Monitoring & Maintenance

### Daily Checks (First Week)
- [ ] Check error logs in hosting dashboard
- [ ] Monitor registration submissions
- [ ] Verify email delivery
- [ ] Check database storage usage

### Weekly Checks
- [ ] Review registration analytics
- [ ] Check system performance
- [ ] Monitor user feedback
- [ ] Update documentation as needed

### Monthly Checks
- [ ] Review hosting costs
- [ ] Analyze usage patterns
- [ ] Plan feature enhancements
- [ ] Update dependencies

---

## Rollback Plan

### If Issues Occur
1. **Immediate:** Revert to previous deployment in hosting dashboard
2. **Quick Fix:** Deploy hotfix from `hotfix` branch
3. **Major Issue:** Take site offline, show maintenance page

### Rollback Steps (Vercel)
1. Go to Deployments tab
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Site reverts in ~30 seconds

### Rollback Steps (Netlify)
1. Go to Deploys tab
2. Find last working deployment
3. Click "Publish deploy"
4. Site reverts in ~30 seconds

---

## Cost Estimates

### Vercel (Hobby Plan - Free)
- **Cost:** $0/month
- **Limits:** 100GB bandwidth, 100 builds/day
- **Suitable for:** Testing and small deployments

### Vercel (Pro Plan)
- **Cost:** $20/month
- **Limits:** 1TB bandwidth, unlimited builds
- **Suitable for:** Production use

### Netlify (Starter - Free)
- **Cost:** $0/month
- **Limits:** 100GB bandwidth, 300 build minutes
- **Suitable for:** Testing and small deployments

### Netlify (Pro)
- **Cost:** $19/month
- **Limits:** 1TB bandwidth, 25,000 build minutes
- **Suitable for:** Production use

### Supabase (Free Tier)
- **Cost:** $0/month
- **Limits:** 500MB database, 1GB file storage
- **Suitable for:** Testing

### Supabase (Pro)
- **Cost:** $25/month
- **Limits:** 8GB database, 100GB file storage
- **Suitable for:** Production use

**Recommended Starting Budget:** $0-45/month (Free tiers + Supabase Pro)

---

## Support Contacts

### Hosting Issues
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Netlify Support:** [netlify.com/support](https://netlify.com/support)

### Database Issues
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)
- **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)

### Development Team
- Check project documentation
- Review implementation guides
- Contact development team lead

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint

# Update dependencies
npm update

# Check build size
npm run build && ls -lh dist/
```

---

## Success Criteria

### Deployment is Successful When:
- ✅ Site loads without errors
- ✅ All pages are accessible
- ✅ Registration flow works end-to-end
- ✅ Emails are delivered
- ✅ Reports generate correctly
- ✅ Mobile view works properly
- ✅ HTTPS is enabled
- ✅ Performance is acceptable (< 3s load time)

---

## Next Steps After Deployment

1. **Announce to Users**
   - Send email to trainers
   - Provide quick start guide
   - Schedule training session

2. **Monitor Usage**
   - Track registration submissions
   - Monitor error rates
   - Gather user feedback

3. **Iterate**
   - Fix reported issues
   - Add requested features
   - Optimize performance

---

*Last Updated: February 18, 2026*  
*Version: 1.0*  
*Status: Ready for Deployment*
