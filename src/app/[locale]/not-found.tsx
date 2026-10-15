import Link from "next/link";
export default function NotFound() {
  return (
    <main className="seo-not-found">
      <h1>404 — Page not found / الصفحة غير موجودة</h1>
      <p>This address does not match a published portfolio page. / هذا الرابط لا يطابق صفحة منشورة.</p>
      <nav aria-label="Return to portfolio">
        <Link href="/en">English homepage</Link>
        <Link href="/ar">الصفحة العربية</Link>
        <Link href="/en#projects">Industrial SCADA projects</Link>
      </nav>
    </main>
  );
}
