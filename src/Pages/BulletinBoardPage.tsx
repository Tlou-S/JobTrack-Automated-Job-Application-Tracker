import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import {
  FaImage,
  FaSmile,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import Navbar from "../Components/Navbar";
import { supabase } from "../lib/supabaseClient";
import "./BulletinBoardPage.css";

type PostCategory = "Announcement" | "Lost & Found" | "Study Group" | "Event";
type PostFilter = "All" | PostCategory;

type Post = {
  id: string;
  author: string;
  authorId: string | null;
  avatar: string;
  category: PostCategory;
  title: string;
  body: string;
  timestamp: string;
  createdAt: number;
  replies: number;
  imagePaths: string[];
  imageUrls: string[];
};

type StoredPost = {
  id: string;
  author_id: string;
  author_name: string;
  category: PostCategory;
  title: string;
  body: string;
  image_paths: string[];
  created_at: string;
};

type DraftImage = {
  file: File;
  previewUrl: string;
};

const STORAGE_BUCKET = "bulletin-attachments";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES_PER_POST = 5;
const EMOJIS = ["😀", "😂", "😊", "😍", "🥳", "👍", "👏", "❤️", "🎉", "📚", "🎓", "✨"];

const samplePosts: Post[] = [
  {
    id: "p1",
    author: "Career Centre",
    authorId: null,
    avatar: "/Sipho.png",
    category: "Announcement",
    title: "Graduate applications open next week",
    body: "Prepare your resume, shortlist roles, and add application deadlines to your tracker before submissions open.",
    timestamp: "2 hours ago",
    createdAt: 5,
    replies: 12,
    imagePaths: [],
    imageUrls: [],
  },
  {
    id: "p2",
    author: "Naledi M.",
    authorId: null,
    avatar: "/Sipho.png",
    category: "Lost & Found",
    title: "Resume review session this afternoon",
    body: "Bring your latest CV draft and get feedback on how to tailor it to graduate roles.",
    timestamp: "5 hours ago",
    createdAt: 4,
    replies: 3,
    imagePaths: [],
    imageUrls: [],
  },
  {
    id: "p3",
    author: "Thabo K.",
    authorId: null,
    avatar: "/Sipho.png",
    category: "Study Group",
    title: "Preparing for technical interviews",
    body: "Sharing practice questions and preparation tips for upcoming software engineering interviews.",
    timestamp: "1 day ago",
    createdAt: 3,
    replies: 8,
    imagePaths: [],
    imageUrls: [],
  },
  {
    id: "p4",
    author: "JobTrack Community",
    authorId: null,
    avatar: "/Sipho.png",
    category: "Event",
    title: "Graduate networking session — this Friday",
    body: "Bring your unwanted textbooks and gadgets to trade in person. Free entry, snacks available.",
    timestamp: "1 day ago",
    createdAt: 2,
    replies: 21,
    imagePaths: [],
    imageUrls: [],
  },
  {
    id: "p5",
    author: "Amahle P.",
    authorId: null,
    avatar: "/Sipho.png",
    category: "Lost & Found",
    title: "Lost student card — name starts with 'S'",
    body: "Dropped somewhere between Wellington campus parking and the cafeteria. Please hand in at reception if found.",
    timestamp: "2 days ago",
    createdAt: 1,
    replies: 1,
    imagePaths: [],
    imageUrls: [],
  },
];

const categoryFilters: PostFilter[] = [
  "All",
  "Announcement",
  "Lost & Found",
  "Study Group",
  "Event",
];

function formatPostTime(timestamp: string) {
  const date = new Date(timestamp);
  const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  if (minutesAgo < 1_440) return `${Math.floor(minutesAgo / 60)} hr ago`;
  return date.toLocaleDateString();
}

export default function BulletinBoardPage() {
  const [activeFilter, setActiveFilter] = useState<PostFilter>("All");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [category, setCategory] = useState<PostCategory>("Announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [composerError, setComposerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previewUrls = useRef(new Set<string>());

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPageError("");

    try {
      const { data, error } = await supabase
        .from("bulletin_posts")
        .select("id, author_id, author_name, category, title, body, image_paths, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setPageError(`Could not load community posts: ${error.message}`);
        return;
      }

      const storedPosts = (data ?? []) as StoredPost[];
      setPosts(storedPosts.map((post) => ({
        id: post.id,
        author: post.author_name,
        authorId: post.author_id,
        avatar: "/Sipho.png",
        category: post.category,
        title: post.title,
        body: post.body,
        timestamp: formatPostTime(post.created_at),
        createdAt: new Date(post.created_at).getTime(),
        replies: 0,
        imagePaths: post.image_paths,
        imageUrls: post.image_paths.map((path) =>
          supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
        ),
      })));
    } catch (error) {
      setPageError(
        `Could not load community posts: ${error instanceof Error ? error.message : "Unexpected error."}`
      );
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) setPageError(`Could not check your sign-in status: ${error.message}`);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    }).catch((error: unknown) => {
      if (!isMounted) return;
      setPageError(
        `Could not check your sign-in status: ${error instanceof Error ? error.message : "Unexpected error."}`
      );
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    };
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!isComposerOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) closeComposer();
    }

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("select")?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isComposerOpen, isSubmitting, draftImages]);

  function releaseDraftImages(images: DraftImage[]) {
    images.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
      previewUrls.current.delete(previewUrl);
    });
  }

  function closeComposer() {
    if (isSubmitting) return;
    releaseDraftImages(draftImages);
    setDraftImages([]);
    setTitle("");
    setBody("");
    setCategory("Announcement");
    setComposerError("");
    setIsEmojiPickerOpen(false);
    setIsComposerOpen(false);
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    setComposerError("");

    const remainingSlots = MAX_IMAGES_PER_POST - draftImages.length;
    if (selectedFiles.length > remainingSlots) {
      setComposerError(`You can attach up to ${MAX_IMAGES_PER_POST} images.`);
    }

    const validFiles = selectedFiles.slice(0, remainingSlots).filter((file) => {
      if (!file.type.startsWith("image/")) {
        setComposerError(`${file.name} is not an image.`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setComposerError(`${file.name} is larger than 10 MB.`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setDraftImages((current) => [...current, ...newImages]);
  }

  function removeDraftImage(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    previewUrls.current.delete(previewUrl);
    setDraftImages((current) => current.filter((image) => image.previewUrl !== previewUrl));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComposerError("");

    if (!user) {
      setComposerError("Please sign in before creating a post.");
      return;
    }
    if (!title.trim()) {
      setComposerError("Add a title for your post.");
      return;
    }
    if (!body.trim()) {
      setComposerError("Write something in your post.");
      return;
    }

    setIsSubmitting(true);
    const uploadedPaths: string[] = [];

    try {
      for (const { file } of draftImages) {
        const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });

        if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`);
        uploadedPaths.push(path);
      }

      const { error } = await supabase.from("bulletin_posts").insert({
        author_id: user.id,
        category,
        title: title.trim(),
        body: body.trim(),
        image_paths: uploadedPaths,
      });

      if (error) throw new Error(`Could not publish your post: ${error.message}`);

      releaseDraftImages(draftImages);
      setDraftImages([]);
      setTitle("");
      setBody("");
      setCategory("Announcement");
      setIsEmojiPickerOpen(false);
      setIsComposerOpen(false);
      await loadPosts();
    } catch (error) {
      const cleanup = uploadedPaths.length
        ? await supabase.storage.from(STORAGE_BUCKET).remove(uploadedPaths)
        : null;
      const cleanupMessage = cleanup?.error
        ? ` Uploaded files could not be cleaned up: ${cleanup.error.message}`
        : "";
      setComposerError(
        `${error instanceof Error ? error.message : "Could not publish your post."}${cleanupMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePost(post: Post) {
    if (!user || post.authorId !== user.id) return;
    if (!window.confirm("Delete this post? This cannot be undone.")) return;

    setDeletingPostId(post.id);
    setPageError("");

    const { data, error } = await supabase
      .from("bulletin_posts")
      .delete()
      .eq("id", post.id)
      .select("id");

    if (error) {
      setPageError(`Could not delete the post: ${error.message}`);
      setDeletingPostId(null);
      return;
    }
    if (!data?.length) {
      setPageError("This post could not be deleted. You can only delete your own posts.");
      setDeletingPostId(null);
      return;
    }

    setPosts((current) => current.filter((item) => item.id !== post.id));
    setDeletingPostId(null);

    if (post.imagePaths.length) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(post.imagePaths);
      if (storageError) {
        setPageError(`Post deleted, but its image attachments could not be removed: ${storageError.message}`);
      }
    }
  }

  const allPosts = [...posts, ...samplePosts].sort((first, second) => second.createdAt - first.createdAt);
  const visiblePosts = activeFilter === "All"
    ? allPosts
    : allPosts.filter((post) => post.category === activeFilter);

  return (
    <div className="bb-page">
      <Navbar />

      <div className="bb-page-header">
        <div>
          <h1>Bulletin Board</h1>
          <p>Announcements, lost & found, study groups and campus events</p>
        </div>
        <button
          className="bb-post-btn"
          type="button"
          onClick={() => {
            setComposerError("");
            setIsComposerOpen(true);
          }}
        >
          Post Something
        </button>
      </div>

      {pageError && <p className="bb-page-error" role="alert">{pageError}</p>}

      <div className="bb-filter-bar">
        {categoryFilters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? "bb-filter-chip bb-active" : "bb-filter-chip"}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bb-list">
        {visiblePosts.map((post) => (
          <article className="bb-post-card" key={post.id}>
            <img src={post.avatar} alt="" className="bb-post-avatar" />

            <div className="bb-post-content">
              <div className="bb-post-meta">
                <span className={`bb-tag bb-tag-${post.category.replace(/\s|&/g, "").toLowerCase()}`}>
                  {post.category}
                </span>
                <span className="bb-post-author">{post.author}</span>
                <span className="bb-post-dot">•</span>
                <span className="bb-post-time">{post.timestamp}</span>
                {user && post.authorId === user.id && (
                  <button
                    className="bb-delete-btn"
                    type="button"
                    onClick={() => void handleDeletePost(post)}
                    disabled={deletingPostId === post.id}
                    aria-label={`Delete post: ${post.title}`}
                  >
                    <FaTrash /> {deletingPostId === post.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>

              <h4 className="bb-post-title">{post.title}</h4>
              <p className="bb-post-body">{post.body}</p>

              {post.imageUrls.length > 0 && (
                <div className="bb-post-images">
                  {post.imageUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={`Attachment for ${post.title}`} loading="lazy" />
                    </a>
                  ))}
                </div>
              )}

              <button className="bb-post-replies" type="button" disabled>
                💬 {post.replies} {post.replies === 1 ? "reply" : "replies"}
              </button>
            </div>
          </article>
        ))}

        {postsLoading && <p className="bb-loading">Loading community posts...</p>}
        {!postsLoading && visiblePosts.length === 0 && (
          <div className="bb-empty">
            <p>No posts in this category yet.</p>
          </div>
        )}
      </div>

      {isComposerOpen && (
        <div
          className="bb-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeComposer();
          }}
        >
          <div
            className="bb-composer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bb-composer-title"
            ref={dialogRef}
          >
            <div className="bb-composer-header">
              <div>
                <h2 id="bb-composer-title">Create a post</h2>
                <p>Share something with your campus community.</p>
              </div>
              <button
                type="button"
                className="bb-modal-close"
                onClick={closeComposer}
                aria-label="Close post composer"
              >
                <FaTimes />
              </button>
            </div>

            {authLoading ? (
              <p className="bb-auth-message">Checking your sign-in status...</p>
            ) : !user ? (
              <div className="bb-auth-message">
                <p>Sign in to publish a post and manage your own posts.</p>
                <div className="bb-auth-links">
                  <Link to="/login?redirect=/bulletin-board" onClick={closeComposer}>Sign in</Link>
                  <Link to="/register" onClick={closeComposer}>Create account</Link>
                </div>
              </div>
            ) : (
              <form className="bb-composer-form" onSubmit={(event) => void handleSubmit(event)}>
                <label className="bb-form-label" htmlFor="bb-category">Category</label>
                <select
                  id="bb-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as PostCategory)}
                >
                  {categoryFilters.filter((filter): filter is PostCategory => filter !== "All").map((filter) => (
                    <option key={filter} value={filter}>{filter}</option>
                  ))}
                </select>

                <label className="bb-form-label" htmlFor="bb-title">Title</label>
                <input
                  id="bb-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  placeholder="Give your post a title"
                  required
                />

                <label className="bb-form-label" htmlFor="bb-body">Message</label>
                <textarea
                  id="bb-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={5000}
                  rows={5}
                  placeholder="What would you like to share?"
                  required
                />

                {draftImages.length > 0 && (
                  <div className="bb-draft-images" aria-label="Image attachments">
                    {draftImages.map(({ file, previewUrl }) => (
                      <div className="bb-draft-image" key={previewUrl}>
                        <img src={previewUrl} alt={file.name} />
                        <button
                          type="button"
                          onClick={() => removeDraftImage(previewUrl)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isEmojiPickerOpen && (
                  <div className="bb-emoji-picker" aria-label="Choose an emoji">
                    {EMOJIS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setBody((current) => `${current}${emoji}`)}
                        aria-label={`Insert ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="bb-composer-tools">
                  <input
                    ref={imageInputRef}
                    className="bb-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    aria-label="Upload image attachments"
                  />
                  <button
                    type="button"
                    className="bb-tool-btn"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={draftImages.length >= MAX_IMAGES_PER_POST}
                  >
                    <FaImage /> Add images
                  </button>
                  <button
                    type="button"
                    className="bb-tool-btn"
                    onClick={() => setIsEmojiPickerOpen((open) => !open)}
                    aria-expanded={isEmojiPickerOpen}
                  >
                    <FaSmile /> Emoji
                  </button>
                  <span className="bb-attachment-hint">Up to {MAX_IMAGES_PER_POST} images, 10 MB each</span>
                </div>

                {composerError && <p className="bb-form-error" role="alert">{composerError}</p>}

                <div className="bb-composer-actions">
                  <button type="button" className="bb-cancel-btn" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button type="submit" className="bb-submit-btn" disabled={isSubmitting}>
                    <FaUpload /> {isSubmitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
