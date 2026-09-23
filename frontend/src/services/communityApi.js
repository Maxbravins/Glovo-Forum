import PostComposer from "../components/community/PostComposer";
import { communityApi } from "../services/communityApi";

const [showComposer, setShowComposer] =
  useState(false);

const [categories, setCategories] =
  useState([]);

const [submitting, setSubmitting] =
  useState(false);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong"
    );
  }

  return data;
}

export const communityApi = {

    createPost(data) {
  return request("/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
},

  reactToPost(postId, type = "LIKE") {
    return request(`/reactions/posts/${postId}`, {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  },

  reactToComment(commentId, type = "LIKE") {
    return request(`/reactions/comments/${commentId}`, {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  },

  followUser(userId) {
    return request(`/follows/users/${userId}`, {
      method: "POST",
    });
  },

  acceptAnswer(postId, commentId) {
    return request(
      `/answers/posts/${postId}/comments/${commentId}/accept`,
      {
        method: "POST",
      }
    );
  },
};
