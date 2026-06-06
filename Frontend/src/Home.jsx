import { useState, useRef } from "react";
import api from "./api";

function Home({ onPostCreated }) {
    const [postText, setPostText] = useState("");
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    function handleImage(e) {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!postText.trim() && !image) {
            return alert("What's on your mind? Please add some text or an image!");
        }

        const postData = new FormData();
        postData.append("content", postText);
        if (image) postData.append('image', image);

        try {
            const response = await api.post('/post', postData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPostText("");
            setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            alert("Post published!");
            if (onPostCreated) onPostCreated(response.data.data);
        } catch (error) {
            alert(error.response?.data?.error || "Error uploading post");
        }
    }

    return (
        <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)",
            marginBottom: "20px",
            border: "1px solid #eaeaea"
        }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "18px", fontWeight: "700", color: "#111" }}>Create Post</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    style={{
                        width: "100%",
                        height: "80px",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #f0f0f0",
                        background: "#f9fbfd",
                        resize: "none",
                        boxSizing: "border-box",
                        fontSize: "15px",
                        color: "#333",
                        outline: "none",
                        fontFamily: "inherit"
                    }}
                />
                
                {image && (
                    <div style={{ fontSize: "13px", color: "#28a745", background: "#e8f5e9", padding: "6px 12px", borderRadius: "6px", display: "inline-block", width: "fit-content" }}>
                        📎 Selected: <strong>{image.name}</strong>
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f5f5f5", paddingTop: "12px" }}>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        color: "#007bff",
                        fontSize: "14px",
                        fontWeight: "500",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#f0f7ff"
                    }}>
                        📷 Add Photo
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleImage} 
                            style={{ display: "none" }} 
                        />
                    </label>

                    <button type="submit" style={{
                        padding: "8px 24px",
                        background: (postText.trim() || image) ? "#007bff" : "#cbd5e1",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        cursor: (postText.trim() || image) ? "pointer" : "not-allowed",
                        fontWeight: "600",
                        fontSize: "14px",
                        transition: "background 0.2s ease"
                    }} disabled={!postText.trim() && !image}>
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Home;