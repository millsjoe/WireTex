import Image from "next/image";
import Link from "next/link";

type NavPage = "home" | "sandbox" | "docs";

interface SiteNavProps {
  current?: NavPage;
  compact?: boolean;
}

const links: { href: string; label: string; page: NavPage }[] = [
  { href: "/", label: "Home", page: "home" },
  { href: "/sandbox", label: "Sandbox", page: "sandbox" },
  { href: "/docs", label: "Docs", page: "docs" },
];

const GITHUB_URL = "https://github.com/millsjoe/WireTex";

export function SiteNav({ current, compact = false }: SiteNavProps) {
  return (
    <header className={`site-nav${compact ? " site-nav-compact" : ""}`}>
      <Link href="/" className="site-nav-brand">
        <Image
          src="/wiretex.png"
          alt="WireTex"
          width={1457}
          height={1166}
          className="site-nav-logo"
          priority
        />
      </Link>
      <nav className="site-nav-links" aria-label="Main">
        {links.map(({ href, label, page }) => (
          <Link
            key={href}
            href={href}
            className={current === page ? "active" : undefined}
            aria-current={current === page ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
        <a
          href={GITHUB_URL}
          className="site-nav-external"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
