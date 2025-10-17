import { useState } from 'react';
import { TodoInput } from './components/TodoInput';
import './App.css';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

function App() {
    const [todos, setTodos] = useState<Todo[]>([]);

    const handleAddTodo = (text: string): void => {
        const newTodo: Todo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
        };
        setTodos([newTodo, ...todos]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    My Todo List
                </h1>

                <TodoInput onSubmit={handleAddTodo} />

                <div className="mt-8">
                    {todos.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No tasks yet. Add one above to get started!
                        </p>
                    ) : (
                        <ul className="max-w-2xl mx-auto space-y-2">
                            {todos.map((todo) => (
                                <li
                                    key={todo.id}
                                    className="bg-white p-4 rounded-lg shadow"
                                >
                                    {todo.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
