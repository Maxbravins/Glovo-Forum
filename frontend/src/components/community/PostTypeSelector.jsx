import {
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Bike,
} from "lucide-react";

const TYPES = [
  {
    value: "DISCUSSION",
    label: "Discussion",
    description: "Start a conversation",
    icon: MessageCircle,
  },
  {
    value: "QUESTION",
    label: "Question",
    description: "Ask the community",
    icon: HelpCircle,
  },
  {
    value: "TIP",
    label: "Tip",
    description: "Share something useful",
    icon: Lightbulb,
  },
  {
    value: "EXPERIENCE",
    label: "Experience",
    description: "Share your experience",
    icon: Bike,
  },
  {
    value: "PROBLEM",
    label: "Problem",
    description: "Get help with an issue",
    icon: AlertTriangle,
  },
  {
    value: "IDEA",
    label: "Idea",
    description: "Suggest an improvement",
    icon: Sparkles,
  },
];

export default function PostTypeSelector({
  value,
  onChange,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TYPES.map((type) => {
        const Icon = type.icon;
        const selected = value === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            aria-pressed={selected}
            className={[
              "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
              selected
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                selected
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700",
              ].join(" ")}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={2}
              />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {type.label}
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                {type.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
