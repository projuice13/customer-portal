import type { Metadata } from "next";
import { LinkCard } from "@/components/home/LinkCard";
import { navItems } from "@/data/nav";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome to the Resource Portal
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-xl">
          Your central hub for product assets, marketing materials, specification
          sheets, and business tools. Select a section below to get started.
        </p>
      </div>

      {/* Section grid */}
      <section aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="sr-only">
          Portal sections
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {navItems
            .filter((item) => item.href !== "/")
            .map((item) => (
              <LinkCard
                key={item.href}
                title={item.label}
                description={item.description ?? ""}
                href={item.href}
                icon={item.icon}
                protected={item.protected}
                comingSoon={item.comingSoon}
                beta={item.beta}
                image={item.image}
              />
            ))}
        </div>
      </section>

    </div>
  );
}
