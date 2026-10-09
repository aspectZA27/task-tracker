import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const { token, logout } = useAuth();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
                }
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token]);

    const handleCreateTask = async e => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ title: newTaskTitle }),
            });
            if (!response.ok) {
                throw new Error("Failed to create task");
            }
            const newTask = await response.json();
            setTasks(prevTasks => [...prevTasks, newTask]);
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleToggleComplete = async (taskId, currentCompleted) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ completed: !currentCompleted }),
            });
            if (!response.ok) {
                throw new Error("Failed to update task");
            }
            const updatedTask = await response.json();
            setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDeleteTask = async taskId => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to delete task");
            }
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-[#0D1117] px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-baseline justify-between border-b border-[#30363D] pb-3 mb-4">
                    <h1 className="text-sm text-[#8B949E] uppercase tracking-wide">Tasks</h1>
                    <div className="flex items-baseline gap-4">
                        <span className="text-xs text-[#8B949E]">
                            {tasks.filter(t => t.completed).length}/{tasks.length} done
                        </span>
                        <button onClick={logout} className="text-xs text-[#8B949E] hover:text-red-400">
                            logout
                        </button>
                    </div>
                </div>

                <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
                    <input
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="new task"
                        className="flex-1 bg-[#161B22] border border-[#30363D] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#3FB950]"
                    />
                    <button
                        type="submit"
                        className="bg-[#3FB950] text-[#0D1117] font-semibold rounded px-4 py-2 text-sm hover:opacity-90"
                    >
                        Add
                    </button>
                </form>

                <ul className="border border-[#30363D] rounded divide-y divide-[#30363D] bg-[#161B22]">
                    {tasks.map(task => (
                        <li key={task.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task.id, task.completed)}
                                className="accent-[#3FB950]"
                            />
                            <span className={`flex-1 ${task.completed ? "line-through text-[#8B949E]" : ""}`}>
                                {task.title}
                            </span>
                            <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-xs text-[#8B949E] hover:text-red-400"
                            >
                                delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Dashboard;
