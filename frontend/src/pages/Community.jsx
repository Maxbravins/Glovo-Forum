import { useEffect, useState } from "react";

import FeedTabs from "../components/community/FeedTabs";
import PostCard from "../components/community/PostCard";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function Community() {
  const [activeFeed, setActiveFeed] =
    useState("trending");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadPosts();
  }, [activeFeed]);

  async function loadPosts() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/posts?feed=${activeFeed}`
      );

      const data = await response.json();

      setPosts(
        Array.isArray(data)
          ? data
          : data.posts || []
      );
    } catch (error) {
      console.error(error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="community-page">
      <header className="community-header">
        <div>
          <p className="eyebrow">
            GLOVO COMMUNITY
          </p>

          <h1>
            Connect. Share. Help.
          </h1>

          <p>
            Ask questions, share experiences,
            discover useful tips and connect with
            the Glovo community.
          </p>
        </div>

        <button className="create-post-button">
          + Create post
        </button>
      </header>

      <FeedTabs
        active={activeFeed}
        onChange={setActiveFeed}
      />

      <section className="community-feed">
        {loading ? (
          <div className="loading">
            Loading community...
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h2>
              Nothing here yet
            </h2>

            <p>
              Be the first person to start
              the conversation.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))
        )}
      </section>
    </main>
  );
}
