import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('glovo_forum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const fetchPosts = async (categorySlug, search, sort, feed) => {
  const params = new URLSearchParams();
  if (categorySlug) params.append('category', categorySlug);
  if (search) params.append('search', search);
  if (sort) params.append('sort', sort);
  if (feed) params.append('feed', feed);

  const res = await api.get(`/posts?${params.toString()}`);
  return res.data;
};

export const fetchPostById = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const createPostApi = async (formData) => {
  const res = await api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deletePostApi = async (id) => {
  await api.delete(`/posts/${id}`);
};

export const fetchComments = async (postId) => {
  const res = await api.get(`/comments/post/${postId}`);
  return res.data;
};

export const createCommentApi = async (formData) => {
  const res = await api.post('/comments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCommentApi = async (id) => {
  await api.delete(`/comments/${id}`);
};

export const toggleLikeApi = async (postId, commentId) => {
  const res = await api.post('/likes/toggle', { postId, commentId });
  return res.data;
};

export const fetchAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const fetchUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const deleteUserApi = async (id) => {
  await api.delete(`/admin/users/${id}`);
};

export const updateUserRoleApi = async (id, role) => {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data;
};

export const toggleUserFollowApi = async (id) => {
  const res = await api.post(`/follows/users/${id}`);
  return res.data;
};

export const submitReportApi = async (target, reason, description) => {
  const res = await api.post('/reports', { ...target, reason, description });
  return res.data;
};

export const fetchPendingReports = async () => {
  const res = await api.get('/reports');
  return res.data;
};

export const updateReportStatusApi = async (id, status) => {
  const res = await api.patch(`/reports/${id}/status`, { status });
  return res.data;
};

export const fetchNotificationsApi = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const fetchPulseUpdatesApi = async () => {
  const res = await api.get('/pulse');
  return res.data;
};

export const createPulseUpdateApi = async (pulseUpdate) => {
  const res = await api.post('/pulse', pulseUpdate);
  return res.data;
};

export const confirmPulseUpdateApi = async (id) => {
  const res = await api.post(`/pulse/${id}/confirm`);
  return res.data;
};

export const fetchSavedPulseAreasApi = async () => {
  const res = await api.get('/pulse/areas');
  return res.data;
};

export const savePulseAreaApi = async (area) => {
  const res = await api.post('/pulse/areas', { area });
  return res.data;
};

export const removeSavedPulseAreaApi = async (id) => {
  const res = await api.delete(`/pulse/areas/${id}`);
  return res.data;
};
