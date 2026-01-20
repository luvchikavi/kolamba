import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-display font-bold text-brand-gradient mb-2">
              KOLAMBA
            </h3>
            <div className="h-0.5 w-24 bg-brand-gradient mb-4"></div>
            <p className="text-sm text-neutral-400 uppercase tracking-widest mb-4">
              The Jewish Culture Club
            </p>
            <p className="text-neutral-400 text-sm max-w-xs">
              מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">קישורים</h4>
            <nav className="flex flex-col gap-2 text-neutral-400 text-sm">
              <Link href="/about" className="hover:text-primary-400 transition-colors">
                אודות
              </Link>
              <Link href="/artists" className="hover:text-primary-400 transition-colors">
                אמנים
              </Link>
              <Link href="/categories" className="hover:text-primary-400 transition-colors">
                קטגוריות
              </Link>
              <Link href="/faq" className="hover:text-primary-400 transition-colors">
                שאלות נפוצות
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">משפטי</h4>
            <nav className="flex flex-col gap-2 text-neutral-400 text-sm">
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                תנאי שימוש
              </Link>
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                מדיניות פרטיות
              </Link>
              <Link href="/contact" className="hover:text-primary-400 transition-colors">
                צור קשר
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            © 2026 Kolamba בע״מ. כל הזכויות שמורות.
          </p>
          <p className="text-neutral-500 text-sm">
            Developed by Drishti Consulting
          </p>
        </div>
      </div>
    </footer>
  );
}
