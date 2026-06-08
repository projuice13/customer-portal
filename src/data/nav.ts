import type { NavItem } from "@/lib/types";

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: "Home",
    description: "Portal overview and quick links",
  },
  {
    label: "Product Info",
    href: "/product-info",
    icon: "Package",
    protected: true,
    description: "Browse products, images, specs and downloads",
    image: "/11.jpg",
  },
  {
    label: "Ask Me Anything",
    href: "/ask",
    icon: "MessageCircle",
    beta: true,
    description: "Ask a question about our products or services",
    image: "/13.png",
  },
  {
    label: "Profit Calculator",
    href: "/profit-calculator",
    icon: "Calculator",
    description: "Calculate selling price, margin and profit",
    image: "/15.jpg",
  },
  {
    label: "Postcode Checker",
    href: "/postcode-checker",
    icon: "MapPin",
    description: "Check which delivery options are available for a postcode",
    image: "/14.jpg",
  },
];
