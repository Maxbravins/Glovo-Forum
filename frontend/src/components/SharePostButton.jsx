import React, { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export const SharePostButton = ({ post, stopPropagation = false, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const sharePost = async (event) => {
    if (stopPropagation) event.stopPropagation();
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('post', post.id);
    const shareUrl = url.toString();
    const shareData = { title: post.title, text: `Join this discussion: ${post.title}`, url: shareUrl };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      } else {
        window.prompt('Copy this link to share the post:', shareUrl);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Unable to share post', error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={sharePost}
      aria-label={copied ? 'Post link copied' : 'Share post'}
      title={copied ? 'Link copied' : 'Share post'}
      className="btn btn-secondary btn-sm"
      style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? 0 : 6 }}
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {!compact && <span>{copied ? 'Link copied' : 'Share'}</span>}
    </button>
  );
};
