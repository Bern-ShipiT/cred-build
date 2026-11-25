// apps/web/middleware.ts
// Next.js middleware wiring entitlements to gated routes.

import { NextResponse, type NextRequest } from 'next/server';
import { defaultEngine } from './lib/entitlements';

export const config = {
  matcher: ['/dashboard/projects/:path*', '/export/:path*', '/tickets/:path*'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const orgId = req.headers.get('x-org-id') ?? 'default';
  const planId = (req.headers.get('x-plan-id') ?? 'free') as any;

  // Integration point: resolve org + plan from your session instead of headers.
  const org = { orgId, planId };

  // Export gate: quality-lock trigger for 1080p/4k on Free; watermark applied at click.
  if (pathname.startsWith('/export')) {
    const quality = (req.nextUrl.searchParams.get('quality') ?? '720p') as any;
    const result = defaultEngine.canExport(org, quality);
    if (!result.allowed) {
      return NextResponse.json(
        { error: result.reason, upgradeTrigger: result.upgradeTrigger },
        { status: 403 },
      );
    }
    const headers = new Headers(req.headers);
    headers.set('x-export-quality', quality);
    return NextResponse.next({ request: { headers } });
  }

  // Project create gate: project-limit trigger at the 4th project on Free.
  if (pathname === '/dashboard/projects' && req.method === 'POST') {
    // Integration point: read active project count from your org usage store.
    const activeProjects = Number(req.headers.get('x-active-projects') ?? '0');
    const result = defaultEngine.canCreateProject(org, activeProjects);
    if (!result.allowed) {
      return NextResponse.json(
        { error: result.reason, upgradeTrigger: result.upgradeTrigger, remaining: result.remaining },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}
