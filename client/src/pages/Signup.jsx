import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Signup failed");
            }
            const data = await response.json();
            login(data.token);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-[#161B22] border border-[#30363D] rounded p-6 space-y-4"
            >
                <h1 className="text-sm text-[#8B949E] uppercase tracking-wide">Sign up</h1>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#3FB950]"
                />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#3FB950]"
                />
                <button
                    type="submit"
                    className="w-full bg-[#3FB950] text-[#0D1117] font-semibold rounded px-3 py-2 text-sm hover:opacity-90"
                >
                    Sign up
                </button>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <p className="text-xs text-[#8B949E]">
                    already registered?{" "}
                    <Link to="/login" className="text-[#3FB950] hover:underline">
                        log in
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;
