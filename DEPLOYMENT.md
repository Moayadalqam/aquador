# Aquad'or Deployment Guide

## Deployment Platform

- **Provider:** Vercel
- **Project:** `aquador-next`
- **Team:** qualiasolutionscy
- **Branch:** `main`
- **Build Command:** `npm run build`
- **Node Version:** 20 (see `.nvmrc`)

## Automatic Deployment

Deploys to Vercel are automatic:
- **Production:** Push to `main` branch
- **Preview:** Any PR/branch creates a preview URL

## Pre-Deploy Checklist

Before pushing to `main`:

- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` - no errors
- [ ] Test locally: `npm run dev`
- [ ] Check environment variables in Vercel dashboard
- [ ] Update `.env.example` if new variables added

## Rollback Procedure

### Option 1: Vercel Dashboard (Fastest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `aquador-next` project
3. Go to **Deployments** tab
4. Find the last working deployment
5. Click **...** > **Promote to Production**

### Option 2: Git Revert (Clean)

```bash
# Revert the last commit
git revert HEAD

# Or reset to specific commit (use with caution)
git reset --hard <commit-hash>
git push --force
```

### Option 3: Vercel CLI

```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Environment Variables

All environment variables must be set in Vercel dashboard:

1. Go to **Settings** > **Environment Variables**
2. Add variables for all environments (Production, Preview, Development)
3. Redeploy after adding new variables

See `.env.example` for available variables.

## Build Troubleshooting

### Build Fails

1. Check Node version: `node -v` (should be 20+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check for TypeScript errors: `npm run lint`

### Runtime Errors

1. Check Vercel Function Logs
2. Check `src/app/error.tsx` for error boundary issues
3. Verify all API routes have proper error handling

## Domain Configuration

- **Production URL:** `https://aquadorcy.com` (to be configured)
- **Preview URL:** `https://aquador-next-*.vercel.app`

### Custom Domain Setup

1. Go to **Settings** > **Domains**
2. Add domain: `aquadorcy.com`
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning

## Monitoring

After deployment:

- [ ] Check site loads correctly
- [ ] Test key user flows (browse products, contact form)
- [ ] Verify SSL certificate is valid
- [ ] Monitor Vercel Analytics (once configured)
- [ ] Check error tracking (once Sentry is configured)

## Security

- Security headers are configured in `next.config.mjs`
- CSP is enabled - update if adding external scripts
- No secrets in code - all use environment variables

## Support

For deployment issues:
- Vercel Status: https://www.vercel-status.com/
- Vercel Docs: https://vercel.com/docs
