import {
  Armchair,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Settings,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Pregled",
    items: [
      { href: "/dashboard", label: "Kontrolna tabla", icon: LayoutDashboard },
    ],
  },
  {
    title: "Planiranje",
    items: [
      { href: "/tasks", label: "Zadaci", icon: ListChecks },
      { href: "/timeline", label: "Vremenska linija", icon: CalendarDays },
      { href: "/budget", label: "Budžet", icon: Wallet },
      { href: "/notes", label: "Beleške", icon: NotebookPen },
    ],
  },
  {
    title: "Gosti",
    items: [
      { href: "/guests", label: "Gosti", icon: Users },
      { href: "/seating", label: "Raspored sedenja", icon: Armchair },
    ],
  },
  {
    title: "Organizacija",
    items: [{ href: "/vendors", label: "Saradnici", icon: Store }],
  },
];

export const secondaryNavItems: NavItem[] = [
  { href: "/settings", label: "Podešavanja", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
