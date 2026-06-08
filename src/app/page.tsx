import type { Metadata } from "next";
import { LinkCard } from "@/components/home/LinkCard";
import { navItems } from "@/data/nav";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              />
            ))}
        </div>
      </section>

      {/* Quick tips */}
      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="tips-heading">
        <h2 id="tips-heading" className="text-sm font-semibold text-slate-700 mb-3">
          Quick tips
        </h2>
        <ul className="space-y-1.5 text-sm text-slate-500">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-400 flex-shrink-0" aria-hidden="true" />
            Use <strong className="text-slate-700">Product Info</strong> to browse all products, download spec sheets, posters and high-res images.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-400 flex-shrink-0" aria-hidden="true" />
            Use <strong className="text-slate-700">Ask Me Anything</strong> to get instant answers about products, delivery, or general questions.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-400 flex-shrink-0" aria-hidden="true" />
            Use the <strong className="text-slate-700">Profit Calculator</strong> to quickly work out selling price, margin and markup for your drinks menu.
          </li>
        </ul>
      </section>
    </div>
  );
}
