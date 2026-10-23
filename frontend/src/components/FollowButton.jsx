import React, { useEffect, useState } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleUserFollowApi } from '../services/api';

export const FollowButton = ({ userId, initialFollowing = false, onFollowChange, onRequestLogin, compact = false }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => setIsFollowing(initialFollowing), [initialFollowing]);

  if (user?.id === userId) return null;

  const toggleFollow = async (event) => {
    event.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const result = await toggleUserFollowApi(userId);
      setIsFollowing(result.following);
      onFollowChange?.(userId, result.following);
    } catch (error) {
      console.error('Unable to update follow status', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClick = (event) => {
    if (user) toggleFollow(event);
    else {
      event.stopPropagation();
      onRequestLogin?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUpdating}
      aria-pressed={isFollowing}
      title={isFollowing ? 'Unfollow member' : 'Follow member'}
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[0.7rem] font-bold transition-colors disabled:opacity-50 ${isFollowing ? 'border-[#00a082]/30 bg-[#00a082]/10 text-[#56d6b3]' : 'border-white/10 text-gray-400 hover:border-[#ffc244]/40 hover:text-[#ffc244]'}`}
    >
      {isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
      {!compact && <span>{isUpdating ? 'Saving…' : isFollowing ? 'Following' : 'Follow'}</span>}
    </button>
  );
};
