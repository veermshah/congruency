// pages/index.js
import { useState } from "react";
import OpenAIApi from "openai";
import Configuration from "openai";
import { motion } from "framer-motion";
import ChatInput from "@/components/ai/ChatInput";
import ContractDisplay from "@/components/ai/ContractDisplay";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [contractText, setContractText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (message) => {
    setMessages((prev) => [...prev, { user: "You", text: message }]);

    try {
      setLoading(true);
      const configuration = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Generate a professional contract based on the following prompt: ${message}` }],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      let contract = "";
      response.data.choices.forEach((choice) => {
        contract += choice.message.content;
      });

      setContractText(contract);
    } catch (error) {
      console.error("Error generating contract:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Section */}
      <div className="w-1/2 bg-white border-r shadow-lg p-4 flex flex-col">
        <div className="flex-grow overflow-auto">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`my-2 p-3 rounded ${
                msg.user === "You" ? "bg-blue-100 self-end" : "bg-gray-200"
              }`}
            >
              <strong>{msg.user}</strong>: {msg.text}
            </motion.div>
          ))}
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>

      {/* Contract Display Section */}
      <div className="w-1/2 bg-gray-50 p-4">
        <ContractDisplay
          loading={loading}
          contractText={contractText}
        />
      </div>
    </div>
  );
}
