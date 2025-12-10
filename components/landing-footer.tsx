import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto max-w-7xl flex flex-col gap-8 px-4 sm:px-6 lg:px-8 md:flex-row md:justify-between">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Civie</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            A daily civic engagement platform that gives you a simple, low-effort way to
            participate in democratic dialogue.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/data" className="hover:text-foreground">
                  Open Data
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-foreground">
                  Transparency
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl mt-8 border-t pt-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Civie. All rights reserved.</p>
      </div>
    </footer>
  );
}

