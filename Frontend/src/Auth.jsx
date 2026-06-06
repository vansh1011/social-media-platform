import { useState } from "react";
import api from "./api";

function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const endpoint = isLogin ? "/login" : "/signup";
        const payload = isLogin ? { email, password } : { username, email, password };

        try {
            const { data } = await api.post(endpoint, payload);
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            onAuthSuccess(data.username);
        } catch (error) {
            alert(error.response?.data?.error || "Authentication failed");
        }
    }

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", fontFamily: "sans-serif" }}>
            <h2>{isLogin ? "Login to SocialFeed" : "Create Account"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {!isLogin && (
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: "8px" }} />
                )}
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "8px" }} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "8px" }} />
                <button type="submit" style={{ padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {isLogin ? "Login" : "Sign Up"}
                </button>
            </form>
            <p onClick={() => setIsLogin(!isLogin)} style={{ color: "#007bff", cursor: "pointer", textAlign: "center", marginTop: "15px" }}>
                {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
            </p>
        </div>
    );
}

export default Auth;