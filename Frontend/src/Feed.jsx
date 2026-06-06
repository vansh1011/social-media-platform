import { useState, useEffect, useRef } from "react";
import api from "./api";

function Feed({ posts, setPosts, page, setPage, hasMore, loading }) {
    const bottomBoundaryRef = useRef(null);
    const currentUsername = localStorage.getItem("username") || "Anonymous";
    const [activeCommentBox, setActiveCommentBox] = useState(null);

    async function handleLike(postID) {
        const currentPost = posts.find((p) => p._id === postID);
        if (!currentPost) return;

        const previousPostsBackup = [...posts];
        const hasLiked = currentPost.likes.includes(currentUsername);
        const updatedLikesArray = hasLiked
            ? currentPost.likes.filter((user) => user !== currentUsername)
            : [...currentPost.likes, currentUsername];

        setPosts((prevPosts) =>
            prevPosts.map((post) => post._id === postID ? { ...post, likes: updatedLikesArray } : post)
        );

        try {
            const result = await api.patch('/like', { postID });
            setPosts((prevPosts) =>
                prevPosts.map((post) => post._id === postID ? result.data : post)
            );
        } catch (error) {
            setPosts(previousPostsBackup);
        }
    }

    async function handleComment(e, postID) {
        e.preventDefault();
        const form = e.target;
        const commentText = form.elements[0].value;
        if (!commentText.trim()) return;

        try {
            const result = await api.post('/comment', { postID, text: commentText });
            setPosts((prevPosts) =>
                prevPosts.map((post) => post._id === postID ? result.data : post)
            );
            form.reset();
        } catch (error) {
            alert("Could not post comment.");
        }
    }

    useEffect(() => {
        const currentRef = bottomBoundaryRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage((prevPage) => prevPage + 1);
            }
        }, { threshold: 0.2 });

        observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [hasMore, loading, setPage]);

    
    const getAvatarColor = (name) => {
        const colors = ["#ff8a65", "#4db6ac", "#64b5f6", "#ba68c8", "#ffd54f"];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>
            {posts.map((post) => {
                const userHasLiked = post.likes.includes(currentUsername);
                return (
                    <div key={post._id} style={{
                        background: "#ffffff",
                        border: "1px solid #eef0f2",
                        borderRadius: "16px",
                        padding: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                    }}>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: getAvatarColor(post.username),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "16px",
                                textTransform: "uppercase"
                            }}>
                                {post.username ? post.username.charAt(0) : "U"}
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>
                                        {post.username || "User"}
                                    </span>
                                    <span style={{ color: "#64748b", fontSize: "13px" }}>
                                        @{post.username || "user"}
                                    </span>
                                </div>
                                <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Just now"}
                                </div>
                            </div>
                            <button style={{
                                background: "#f0f7ff",
                                color: "#007bff",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}>
                                Follow
                            </button>
                        </div>
                        
                        
                        {post.content && (
                            <p style={{ margin: "0 0 12px 0", color: "#334155", fontSize: "15px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                                {post.content}
                            </p>
                        )}

                       
                        {post.imgUrl && (
                            <div style={{ margin: "0 -16px 12px -16px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                                <img 
                                    src={post.imgUrl} 
                                    alt="Post asset" 
                                    style={{ width: "100%", maxHeight: "450px", objectFit: "contain", display: "block", margin: "0 auto" }} 
                                />
                            </div>
                        )}

                       
                        <div style={{
                            display: "flex", 
                            gap: "24px", 
                            alignItems: "center", 
                            borderTop: "1px solid #f1f5f9", 
                            paddingTop: "10px",
                            color: "#64748b"
                        }}>
                            <div 
                                onClick={() => handleLike(post._id)}
                                style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: userHasLiked ? "#ef4444" : "#64748b" }}
                            >
                                <span style={{ fontSize: "18px" }}>{userHasLiked ? "❤️" : "♡"}</span> 
                                <span>{post.likes.length}</span>
                            </div>
                            
                            <div 
                                onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)}
                                style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
                            >
                                <span style={{ fontSize: "18px" }}>💬</span> 
                                <span>{post.comments?.length || 0}</span>
                            </div>
                        </div>

                      
                        {(activeCommentBox === post._id || post.comments?.length > 0) && (
                            <div style={{ marginTop: "12px", borderTop: "1px solid #f8fafc", paddingTop: "12px" }}>
                                {post.comments?.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc", padding: "10px", borderRadius: "10px", marginBottom: "12px" }}>
                                        {post.comments.map((c, i) => (
                                            <div key={i} style={{ fontSize: "13px", lineHeight: "1.4" }}>
                                                <strong style={{ color: "#334155" }}>@{c.username}</strong>{" "}
                                                <span style={{ color: "#475569" }}>{c.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <form onSubmit={(e) => handleComment(e, post._id)} style={{ display: "flex", gap: "8px" }}>
                                    <input 
                                        type="text" 
                                        placeholder="Add a comment..." 
                                        style={{ 
                                            flexGrow: 1, 
                                            padding: "8px 12px", 
                                            borderRadius: "20px", 
                                            border: "1px solid #e2e8f0", 
                                            outline: "none",
                                            fontSize: "13px",
                                            background: "#fff"
                                        }} 
                                    />
                                    <button type="submit" style={{ 
                                        padding: "6px 14px", 
                                        background: "#007bff", 
                                        color: "white", 
                                        border: "none", 
                                        borderRadius: "20px", 
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: "600"
                                    }}>
                                        Send
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                );
            })}

            {loading && <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px" }}>Loading feed posts...</p>}
            {hasMore ? <div ref={bottomBoundaryRef} style={{ height: "10px" }} /> : <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "10px" }}>You've caught up! No more posts.</p>}
        </div>
    );
}

export default Feed;