
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Posts({ role, user }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EDIT POST STATES
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const userId = user?._id || user?.id;
  const userRole = (user?.role || role || "").toLowerCase();
  const isAdmin = userRole === "admin";

  // GET ALL POSTS
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api("/posts");
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // CREATE POST
  const createPost = async (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setError("");

      await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      });

      setTitle("");
      setContent("");

      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  // LIKE / UNLIKE POST
  const likePost = async (post) => {
    const liked = (post.likes || []).some(
      (id) => String(id?._id || id) === String(userId)
    );

    try {
      await api(`/posts/${post._id}/like`, {
        method: liked ? "DELETE" : "POST"
      });

      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  // SEARCH POSTS
  const searchPosts = async (event) => {
    event.preventDefault();

    if (!keyword.trim()) {
      await loadPosts();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await api(
        `/posts/search?keyword=${encodeURIComponent(keyword.trim())}`
      );

      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // FILTER POSTS
  const filterPosts = async (value) => {
    setSortBy(value);

    try {
      setLoading(true);
      setError("");

      const data = await api(`/posts/filter?sortBy=${value}`);
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // START EDIT POST
  const startEditPost = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  // CANCEL EDIT
  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  // UPDATE POST
  const updatePost = async (event, postId) => {
    event.preventDefault();

    if (!editTitle.trim() || !editContent.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setError("");

      await api(`/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim()
        })
      });

      cancelEditPost();
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  // LOAD COMMENTS
  const loadComments = async (postId) => {
    try {
      const data = await api(`/comments/${postId}`);

      setComments((old) => ({
        ...old,
        [postId]: data.comments || []
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // ADD COMMENT
  const addComment = async (postId) => {
    const text = (commentText[postId] || "").trim();

    if (!text) return;

    try {
      await api(`/comments/${postId}`, {
        method: "POST",
        body: JSON.stringify({ content: text })
      });

      setCommentText((old) => ({
        ...old,
        [postId]: ""
      }));

      await loadComments(postId);
    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE COMMENT
  const deleteComment = async (commentId, postId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      setError("");

      await api(`/comments/${commentId}`, {
        method: "DELETE"
      });

      setComments((old) => ({
        ...old,
        [postId]: (old[postId] || []).filter(
          (comment) => comment._id !== commentId
        )
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE POST
  const deletePost = async (post) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      setError("");

      const endpoint = isAdmin
        ? `/posts/admin/${post._id}`
        : `/posts/${post._id}`;

      await api(endpoint, {
        method: "DELETE"
      });

      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-section">

      {/* PAGE HEADER */}
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">CAMPUS FEED</span>
          <h1>Posts</h1>
          <p>
            Announcements, conversations and campus updates
            connected to your Campus Connect backend.
          </p>

          <div className="hero-mini-row">
            <span className="glass mini-pill">
              ✦ {userRole}
            </span>
            <span className="glass mini-pill">
              ● Connected
            </span>
          </div>
        </div>

        <div className="hero-sculpture" aria-hidden="true">
          <div className="sculpture-core" />
          <div className="sculpture-ring" />
        </div>
      </div>

      {/* CREATE POST */}
      <form className="post-composer glass" onSubmit={createPost}>
        <div className="composer-top">
          <span className="card-kicker">CREATE POST</span>
          <span>{user?.name || "Campus User"}</span>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with your campus..."
          rows="3"
          required
        />

        <button className="continue-button small-button" type="submit">
          Publish <span>→</span>
        </button>
      </form>

      {/* SEARCH */}
      <div className="post-toolbar glass">
        <form onSubmit={searchPosts} className="flex flex-wrap gap-3">
          <input
            className="min-w-0 flex-1"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search posts..."
          />

          <button type="submit">
            Search
          </button>
        </form>

        {/* FILTER */}
        <select
          value={sortBy}
          onChange={(e) => filterPosts(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Popular</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setKeyword("");
            setSortBy("latest");
            loadPosts();
          }}
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="form-error page-error">
          {error}
        </div>
      )}

      {/* POSTS */}
      {loading ? (
        <div className="content-card glass">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="content-card glass">
          <div>
            <span className="card-kicker">CAMPUS</span>
            <h3>No posts found</h3>
            <p>Create a post or try another search.</p>
          </div>
        </div>
      ) : (
        <div className="post-list">

          {posts.map((post) => {
            const liked = (post.likes || []).some(
              (id) => String(id?._id || id) === String(userId)
            );

            const authorId = post.author?._id || post.author;
            const isOwner = String(authorId) === String(userId);
            const canDelete = isAdmin || isOwner;

            return (
              <article className="post-card glass" key={post._id}>

                {/* AUTHOR */}
                <div className="post-meta">
                  <div className="avatar">
                    {post.author?.name?.slice(0, 1).toUpperCase() || "C"}
                  </div>

                  <div>
                    <b>{post.author?.name || "Campus user"}</b>
                    <small>
                      {new Date(post.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>

                {/* EDIT POST FORM */}
                {editingPostId === post._id ? (
                  <form
                    className="post-composer glass"
                    onSubmit={(event) => updatePost(event, post._id)}
                  >
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Edit title"
                      required
                    />

                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit content"
                      rows="3"
                      required
                    />

                    <div className="post-actions">
                      <button type="submit">
                        Save Changes
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditPost}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* CONTENT */}
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                  </>
                )}

                {/* ACTIONS */}
                <div className="post-actions">

                  <button
                    type="button"
                    onClick={() => likePost(post)}
                    disabled={!userId}
                  >
                    {liked ? "♥" : "♡"} {post.likes?.length || 0}
                  </button>

                  <button
                    type="button"
                    onClick={() => loadComments(post._id)}
                  >
                    Comments
                  </button>

                  {/* EDIT OWN POST */}
                  {isOwner && editingPostId !== post._id && (
                    <button
                      type="button"
                      onClick={() => startEditPost(post)}
                    >
                      Edit
                    </button>
                  )}

                  {/* DELETE POST */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                    >
                      Delete
                    </button>
                  )}

                </div>

                {/* COMMENTS */}
                {comments[post._id] && (
                  <div className="comments">

                    <div className="comment-list">
                      {comments[post._id].map((comment) => {
                        const commentAuthorId =
                          comment.author?._id || comment.author;

                        const isCommentOwner =
                          String(commentAuthorId) === String(userId);

                        return (
                          <div className="comment" key={comment._id}>
                            <b>
                              {comment.author?.name || "User"}
                            </b>

                            <span>{comment.content}</span>

                            {/* DELETE OWN COMMENT */}
                            {isCommentOwner && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteComment(comment._id, post._id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {comments[post._id].length === 0 && (
                        <p>No comments yet.</p>
                      )}
                    </div>

                    {/* ADD COMMENT */}
                    <div className="comment-box">
                      <input
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText((old) => ({
                            ...old,
                            [post._id]: e.target.value
                          }))
                        }
                        placeholder="Write a comment..."
                      />

                      <button
                        type="button"
                        onClick={() => addComment(post._id)}
                      >
                        Send
                      </button>
                    </div>

                  </div>
                )}

              </article>
            );
          })}

        </div>
      )}

    </section>
  );
}
