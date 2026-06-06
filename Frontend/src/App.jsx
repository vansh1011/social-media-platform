import { useState, useEffect, useCallback } from "react";
import Auth from "./Auth";
import Home from "./Home";
import Feed from "./Feed";
import api from "./api";

function App() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function checkSession() {
            try {
                const { data } = await api.get('/me');
                setUser(data.username);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, []);

    const fetchPosts = useCallback(async (pageNumber, clearExisting = false) => {
        try {
            const response = await api.get(`/feed?page=${pageNumber}&limit=5`);
            const { posts: newPosts, hasMore: serverHasMore } = response.data;

            setPosts((prev) => {
                const base = clearExisting ? [] : prev;
                const combined = [...base, ...newPosts];
                return combined.filter((p, idx, self) => self.findIndex((pos) => pos._id === p._id) === idx);
            });
            setHasMore(serverHasMore);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    }, []);

    useEffect(() => {
        if (user) fetchPosts(page);
    }, [page, user, fetchPosts]);

    const handleNewPost = (newPost) => {
        setPosts((prev) => [newPost, ...prev]);
    };

    async function handleLogout() {
        try {
            await api.post('/logout');
            setUser(null);
            setPosts([]);
            setPage(1);
        } catch (err) {
            alert("Logout request failed");
        }
    }

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>Verifying session secure handshakes...</div>;
    }

    if (!user) {
        return <Auth onAuthSuccess={(username) => setUser(username)} />;
    }

    return (
        <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "20px 10px" }}>
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontFamily: "sans-serif" }}>Welcome, @{user}</h2>
                    <button onClick={handleLogout} style={{ padding: "6px 12px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
                </div>
                <Home onPostCreated={handleNewPost} />
                <Feed 
                    posts={posts} setPosts={setPosts} fetchPosts={fetchPosts}
                    page={page} setPage={setPage} hasMore={hasMore} loading={loading} 
                />
            </div>
        </div>
    );
}

export default App;