const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

const SNAP_WEB_BASE = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v2/vtweb"
  : "https://app.sandbox.midtrans.com/snap/v2/vtweb";

export function snapRedirectUrl(snapToken: string): string {
  return `${SNAP_WEB_BASE}/${encodeURIComponent(snapToken)}`;
}
