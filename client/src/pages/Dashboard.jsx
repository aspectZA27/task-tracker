import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const { token } = useAuth();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("http://localhost:3001/tasks", {
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
            const response = await fetch("http://localhost:3001/tasks", {
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
            const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
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
            const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
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

    return (
        <div>
            <h1>Dashboard</h1>
            <form onSubmit={handleCreateTask}>
                <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title" />
                <button type="submit">Create Task</button>
            </form>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        {task.title}
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id, task.completed)}
                        />
                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;
