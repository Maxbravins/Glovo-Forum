import { Heart } from "lucide-react";
import { useState } from "react";

import { communityApi } from "../../services/communityApi";

export default function ReactionButton({
  postId,
  initialCount = 0,
  initialReacted = false,
}) {
  const [reacted, setReacted] = useState(initialReacted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;

    try {
      setLoading(true);

      const result = await communityApi.reactToPost(postId);

      setReacted(result.reacted);

      setCount((current) =>
        result.reacted
          ? current + 1
          : Math.max(0, current - 1)
      );
    } catch (error) {
      console.error("Failed to update reaction:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={reacted ? "Unlike post" : "Like post"}
      aria-pressed={reacted}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
        "text-sm font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        reacted
          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "text-slate-500 hover:bg-slate-100 hover:text-rose-500",
      ].join(" ")}
    >
      <Heart
        className={[
          "h-4 w-4 transition-all",
          reacted && "fill-current",
          loading && "animate-pulse",
        ]
          .filter(Boolean)
          .join(" ")}
        strokeWidth={2}
      />

      <span>{count}</span>
    </button>
  );
}
