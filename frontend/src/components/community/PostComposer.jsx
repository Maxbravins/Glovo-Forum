import { useState } from "react";
import {
  ImagePlus,
  Send,
  X,
  FileText,
} from "lucide-react";

import PostTypeSelector from "./PostTypeSelector";

const INITIAL_FORM = {
  title: "",
  content: "",
  categoryId: "",
  type: "DISCUSSION",
  tags: [],
};

export default function PostComposer({
  categories = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function addTag(event) {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();

    const tag = tagInput.trim().replace(/^#/, "");

    if (!tag) return;

    if (form.tags.includes(tag)) {
      setTagInput("");
      return;
    }

    if (form.tags.length >= 10) {
      setError("You can add up to 10 tags.");
      return;
    }

    setForm((current) => ({
      ...current,
      tags: [...current.tags, tag],
    }));

    setTagInput("");
  }

  function removeTag(tagToRemove) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter(
        (tag) => tag !== tagToRemove
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (title.length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    if (!content) {
      setError("Please write something before posting.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        ...form,
        title,
        content,
        categoryId: Number(form.categoryId),
      });

      setForm(INITIAL_FORM);
      setTagInput("");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create your post. Please try again."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-100
          px-5
          py-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-emerald-50
              text-emerald-600
            "
          >
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Create a post
            </h2>

            <p className="text-xs text-slate-500">
              Share something with the community
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
            className="
              rounded-lg
              p-2
              text-slate-400
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
            "
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-6 p-5">
        {/* Post type */}
        <div>
          <label
            className="
              mb-3
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            What do you want to post?
          </label>

          <PostTypeSelector
            value={form.type}
            onChange={(value) =>
              updateField("type", value)
            }
          />
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="post-title"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Title
          </label>

          <input
            id="post-title"
            type="text"
            value={form.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
              )
            }
            placeholder="Give your post a clear title"
            maxLength={200}
            disabled={submitting}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-500/20
              disabled:bg-slate-50
            "
          />

          <div className="mt-1.5 flex justify-end">
            <span className="text-xs text-slate-400">
              {form.title.length}/200
            </span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="post-category"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Category
          </label>

          <select
            id="post-category"
            value={form.categoryId}
            onChange={(event) =>
              updateField(
                "categoryId",
                event.target.value
              )
            }
            disabled={submitting}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              text-slate-700
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-500/20
              disabled:bg-slate-50
            "
          >
            <option value="">
              Select a category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="post-content"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Your post
          </label>

          <textarea
            id="post-content"
            value={form.content}
            onChange={(event) =>
              updateField(
                "content",
                event.target.value
              )
            }
            placeholder="Tell the community what's on your mind..."
            rows={7}
            maxLength={20000}
            disabled={submitting}
            className="
              w-full
              resize-y
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              leading-6
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-500/20
              disabled:bg-slate-50
            "
          />

          <div className="mt-1.5 flex justify-end">
            <span className="text-xs text-slate-400">
              {form.content.length}/20,000
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="post-tags"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Tags
          </label>

          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              focus-within:border-emerald-500
              focus-within:ring-2
              focus-within:ring-emerald-500/20
            "
          >
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-md
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-xs
                    font-medium
                    text-emerald-700
                  "
                >
                  #{tag}

                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="
                      rounded
                      p-0.5
                      text-emerald-500
                      hover:bg-emerald-100
                      hover:text-emerald-700
                    "
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <input
                id="post-tags"
                type="text"
                value={tagInput}
                onChange={(event) =>
                  setTagInput(event.target.value)
                }
                onKeyDown={addTag}
                placeholder={
                  form.tags.length
                    ? "Add another tag"
                    : "Type a tag and press Enter"
                }
                disabled={
                  submitting ||
                  form.tags.length >= 10
                }
                className="
                  min-w-[180px]
                  flex-1
                  border-0
                  bg-transparent
                  px-1
                  py-1
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  disabled:cursor-not-allowed
                "
              />
            </div>
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            Add up to 10 tags.
          </p>
        </div>

        {/* Attachment placeholder */}
        <button
          type="button"
          disabled={submitting}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-dashed
            border-slate-300
            px-3
            py-2
            text-sm
            font-medium
            text-slate-600
            transition-colors
            hover:border-emerald-400
            hover:bg-emerald-50
            hover:text-emerald-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <ImagePlus className="h-4 w-4" />
          Add image
        </button>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="
          flex
          items-center
          justify-end
          gap-3
          border-t
          border-slate-100
          bg-slate-50/50
          px-5
          py-4
        "
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              transition-colors
              hover:bg-slate-100
              hover:text-slate-900
              disabled:opacity-50
            "
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-emerald-600
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-emerald-700
            hover:shadow
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            focus:ring-offset-2
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <Send
            className={`h-4 w-4 ${
              submitting ? "animate-pulse" : ""
            }`}
          />

          {submitting
            ? "Publishing..."
            : "Publish post"}
        </button>
      </div>
    </form>
  );
}
