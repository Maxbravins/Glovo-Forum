import {
  Flame,
  Clock3,
  Users,
  CircleHelp,
} from "lucide-react";

const TABS = [
  {
    id: "trending",
    label: "Trending",
    icon: Flame,
  },
  {
    id: "latest",
    label: "Latest",
    icon: Clock3,
  },
  {
    id: "following",
    label: "Following",
    icon: Users,
  },
  {
    id: "unanswered",
    label: "Unanswered",
    icon: CircleHelp,
  },
];

export default function FeedTabs({
  active,
  onChange,
}) {
  return (
    <nav
      aria-label="Community feed"
      className="
        flex
        gap-1
        overflow-x-auto
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-1
        scrollbar-none
      "
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={
              isActive ? "page" : undefined
            }
            className={[
              "inline-flex shrink-0 items-center gap-2",
              "rounded-lg px-4 py-2.5",
              "text-sm font-medium",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2",
              "focus:ring-emerald-500 focus:ring-offset-1",
              isActive
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
            ].join(" ")}
          >
            <Icon
              className="h-4 w-4"
              strokeWidth={2}
            />

            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
