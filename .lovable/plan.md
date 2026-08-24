# Plan: Connect your custom domain to Trikaala's Lovable deployment

## Current state
- Published URL: `https://trikaala.lovable.app`
- No custom domain is connected yet.
- Vercel deployment is separate and won't receive updates from Lovable Publish.

## Goal
Connect your existing domain (currently on Vercel) to the Lovable-hosted deployment so that `Publish` updates go live automatically on your domain.

## Steps

1. Check current domain status
   - Confirm no custom domain is attached in the project yet.

2. Add the custom domain in Lovable
   - Open Project Settings → Domains (or the Publish dialog → Add custom domain).
   - Enter the domain you want to use (e.g., the one currently on Vercel).
   - Lovable will provide DNS records (A/AAAA or CNAME) to configure at your registrar/DNS provider.

3. Update DNS records
   - Replace the Vercel DNS records with the values provided by Lovable.
   - Wait for DNS propagation (typically a few minutes, up to 24 hours).

4. Verify domain connection
   - Confirm the domain shows as verified/connected in Lovable.

5. Update code references if needed
   - If any files reference the published Lovable URL or old Vercel URL, update them to use the new canonical domain.
   - Known references to check: `__root.tsx` og:image/twitter:image URLs, `sitemap.xml.ts` base URL, `robots.txt` sitemap URL.

6. Publish the site
   - Trigger a new Publish so the latest build is deployed to the custom domain.

7. Confirm the fix
   - Visit the custom domain and verify it loads the latest version of Trikaala.

## Notes
- This will keep the app hosted on Lovable's infrastructure (Cloudflare Workers) instead of Vercel.
- Future code changes will update the domain automatically when you click Publish in Lovable.
- Your Vercel deployment can be left in place or removed once the domain is confirmed working.
