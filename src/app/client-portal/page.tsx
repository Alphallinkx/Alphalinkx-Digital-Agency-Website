import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Two26Button } from '@/components/common/Two26Button';
import { BRAND } from '@/content/siteContent';

export const metadata: Metadata = {
  title: 'Client Portal | Alphalinkx',
};

export const dynamic = 'force-dynamic';

export default function ClientPortalPage() {
  const portalUrl = process.env.CLIENT_PORTAL_URL?.trim();
  if (portalUrl && URL.canParse(portalUrl) && new URL(portalUrl).protocol === 'https:') {
    redirect(portalUrl);
  }

  return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f5ebea] px-6 pb-16 pt-32 text-center">
      <div className="max-w-lg">
        <h1 className="font-display text-5xl font-black tracking-tight sm:text-6xl">Client Portal</h1>
        <p className="my-6 text-base leading-relaxed text-[#333333] sm:text-lg">
          Existing clients can contact the Alphalinkx team to request their portal link or get help signing in.
        </p>
        <Two26Button href={`mailto:${BRAND.email}?subject=Client%20portal%20access`}>
          Request Portal Access
        </Two26Button>
      </div>
    </main>
  );
}
