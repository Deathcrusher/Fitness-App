# FitFlow security operations

- Supabase enforces an authenticated UUID allowlist with restrictive RLS policies and per-owner SELECT/INSERT rules. Never substitute frontend-only authorization. Keep anon grants revoked, and snapshot UPDATE/DELETE revoked.
- Production is a static PWA. Supabase publishable keys are public by design; service-role/secret keys must never enter client code.
- CI uses a committed dependency lockfile and fails on high/critical npm audit findings. Configure required CI status checks in GitHub and Vercel to gate releases; a failing workflow alone does not stop an automatic Vercel deploy.
- Keep self-registration disabled in Supabase Auth settings. Enable leaked-password protection if supported by the plan, require strong unique passwords, and review auth rate limits. Admin-approved account IDs must correspond to intended users. Do not create extra accounts without checking cloud ownership and migration requirements.
- Browser session tokens and offline training data currently use localStorage. They are not protected from scripts running on the origin or people with local device access. Do not share browser profiles. Moving tokens to HttpOnly/Secure/SameSite cookies requires a reviewed backend and CSRF protection, plus PWA compatibility tests. MFA is not enabled by this change.
- Consider private repository visibility in GitHub settings; this does not protect public static assets or replace RLS. Verify Git integration after changing visibility.
- Verify login, logout, revocation, syncing, iOS PWA and video embedding on the deployed release. Do not remove local data or change cloud ownership to repair login issues.
