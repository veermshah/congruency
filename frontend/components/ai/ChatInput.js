// components/ChatInput.js
import { useState } from "react";

export default function ChatInput({ onSendMessage }) {
    const [input, setInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 flex">
            <input
                type="text"
                className="flex-grow p-2 border rounded-l shadow"
                placeholder="Enter your prompt here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 rounded-r shadow"
            >
                Send
            </button>
        </form>
    );
}
