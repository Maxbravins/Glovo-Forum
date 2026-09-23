import {
  AlertTriangle,
  Bike,
  Bookmark,
  Eye,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Megaphone,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import ReactionButton from "./ReactionButton";

const TYPE_CONFIG = {
  DISCUSSION: {
    label: "Discussion",
    icon: MessageCircle,
  },
  QUESTION: {
    label: "Question",
    icon: HelpCircle,
  },
  TIP: {
    label: "Tip",
    icon: Lightbulb,
  },
  EXPERIENCE: {
    label: "Experience",
    icon: Bike,
  },
  PROBLEM: {
    label: "Problem",
    icon: AlertTriangle,
  },
  IDEA: {
    label: "Idea",
    icon: Sparkles,
  },
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: Megaphone,
  },
};

export default function PostCard({ post }) {
  const type =
    TYPE_CONFIG[post.type] ||
    TYPE_CONFIG.DISCUSSION;

  const TypeIcon = type.icon;

  const commentCount =
    post._count?.comments || 0;

  const reactionCount =
    post._count?.reactions ??
    post._count?.likes ??
    0;

  const content =
    post.content?.length > 240
      ? `${post.content.slice(0, 240)}...`
      : post.content;

  return (
    <article
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-md
      "
    >
      {/* Post metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            bg-emerald-50
            px-3
            py-1.5
            text-xs
            font-semibold
            text-emerald-700
          "
        >
          <TypeIcon
            className="h-3.5 w-3.5"
            strokeWidth={2}
          />

          {type.label}
        </span>

        {post.solved && (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-green-50
              px-3
              py-1.5
              text-xs
              font-semibold
              text-green-700
            "
          >
            <CheckCircle2
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />

            Solved
          </span>
        )}

        {post.pinned && (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-amber-50
              px-3
              py-1.5
              text-xs
              font-semibold
              text-amber-700
            "
          >
            Pinned
          </span>
        )}
      </div>

      {/* Title */}
      <h2
        className="
          mt-4
          line-clamp-2
          text-lg
          font-bold
          tracking-tight
          text-slate-900
          transition-colors
          group-hover:text-emerald-700
        "
      >
        {post.title}
      </h2>

      {/* Content */}
      {content && (
        <p
          className="
            mt-2
            line-clamp-3
            text-sm
            leading-6
            text-slate-600
          "
        >
          {content}
        </p>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.slice(0, 5).map((postTag) => {
            const tag = postTag.tag || postTag;

            return (
              <span
                key={tag.id || tag.slug || tag.name}
                className="
                  rounded-md
                  bg-slate-100
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  text-slate-600
                "
              >
                #{tag.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        {post.user?.avatar ? (
          <img
            src={post.user.avatar}
            alt=""
            className="
              h-9
              w-9
              rounded-full
              object-cover
              ring-2
              ring-white
            "
          />
        ) : (
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-emerald-100
              text-sm
              font-bold
              text-emerald-700
            "
          >
            {post.user?.username
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">
              {post.user?.username || "Community member"}
            </span>

            {post.user?.role === "RIDER" && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-md
                  bg-slate-100
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-600
                "
              >
                <Bike className="h-3 w-3" />
                Rider
              </span>
            )}
          </div>

          {post.category?.name && (
            <span className="text-xs text-slate-500">
              {post.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          border-t
          border-slate-100
          pt-4
        "
      >
        <div className="flex items-center gap-4">
          <ReactionButton
            postId={post.id}
            initialCount={reactionCount}
            initialReacted={post.userReacted}
          />

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              text-sm
              text-slate-500
            "
          >
            <MessageCircle className="h-4 w-4" />

            {commentCount}
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              text-sm
              text-slate-500
            "
          >
            <Eye className="h-4 w-4" />

            {post.views || 0}
          </span>
        </div>

        <button
          type="button"
          aria-label="Save post"
          className="
            rounded-lg
            p-2
            text-slate-400
            transition-colors
            hover:bg-slate-100
            hover:text-emerald-600
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
          "
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
