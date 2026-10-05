import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }
            const data = await response.json();
            login(data.token);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
            {error && <p>{error}</p>}
        </form>
    );
}

export default Login;
