"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import Link from "next/link";

export default function ContractGenerator() {
    const [chat, setChat] = useState("");
    const [contract, setContract] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fileName, setFileName] = useState(""); // New state to hold the file name
    const supabase = createClient();
    const router = useRouter();

    const sendMessage = async () => {
        if (!chat.trim()) return;
        setLoading(true);
        setContract("");
        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: chat }),
            });

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Response body is null");
            }
            const decoder = new TextDecoder();

            let rawContract = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                rawContract += decoder.decode(value, { stream: true });
            }
            // Remove leading and trailing double quotes
            const sanitizedContract = rawContract.replace(/^"|"$/g, "");
            setContract(sanitizedContract);
        } catch (error) {
            console.error("Error generating contract:", error);
        }
        setLoading(false);
    };

    const saveAsPdfAndUpload = async () => {
        const editableDiv = document.querySelector("[contentEditable=true]"); // Select the editable div
        if (
            !(editableDiv instanceof HTMLElement) ||
            !editableDiv.innerText.trim()
        )
            return; // Ensure it exists and has content

        setSaving(true);

        try {
            // Step 1: Use html2canvas to render the editable div
            const canvas = await html2canvas(editableDiv, { scale: 2 });

            // Step 2: Get the canvas data as an image
            const imgData = canvas.toDataURL("image/png");

            // Step 3: Use jsPDF to create the PDF
            const doc = new jsPDF("p", "mm", "a4");
            const imgWidth = 210; // A4 page width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Scale height proportionally

            doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

            // Step 4: Output PDF as blob
            const pdfBlob = doc.output("blob");

            // Step 5: Upload the PDF to Supabase
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) {
                router.push("/sign-in");
                return;
            }

            const filePath = `${user.id}/${fileName || Date.now()}.pdf`; // Use file name if provided

            const { error: uploadError } = await supabase.storage
                .from("contracts")
                .upload(filePath, pdfBlob, { contentType: "application/pdf" });

            if (uploadError) throw uploadError;

            alert("Contract saved successfully!");
        } catch (error) {
            console.error("Error saving contract:", error);
            alert("Failed to save contract. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="absolute flex left-0 right-0 top-16 bottom-0">
            {/* Chat Section */}
            <div className="flex flex-col p-10 border border-gray-300 w-1/2">
                <div className="text-4xl text-teal-400 font-bold mb-4">
                    Generate
                </div>

                <p className="mb-4">
                    Type your request below and click "Send" to generate a
                    contract. Include details like the parties involved, terms,
                    and any other relevant information.
                </p>
                <textarea
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    placeholder="Type your request..."
                    className="flex-grow mb-2 p-2 border border-gray-300 resize-none"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="rounded mb-2 bg-teal-400 text-white font-bold px-3 py-2 w-full text-center hover:scale-105 active:scale-90 duration-100"
                >
                    {loading ? "Generating..." : "Send"}
                </button>
                <Link
                    href={"/protected/view"}
                    className="rounded bg-teal-400 text-white font-bold px-3 py-2 w-full text-center hover:scale-105 active:scale-90 duration-100"
                >
                    View Your Contracts
                </Link>
            </div>
            {/* Contract Section */}
            <div className="w-1/2 overflow-auto">
                <div className="flex flex-col items-center justify-center text-gray-500">
                    {contract ? (
                        <div contentEditable={true} className="p-4 text-black">
                            {contract
                                .replace(/\\n/g, "\n")
                                .split(/\r?\n/)
                                .map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                        </div>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mt-64 mb-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m2 0a2 2 0 110 4H7a2 2 0 110-4m14 0a6 6 0 10-12 0m6 6v-6m-6 6v-6"
                                />
                            </svg>
                            <p className="text-gray-500">
                                Generated contract will appear here
                            </p>
                        </>
                    )}
                </div>

                {contract && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="File Name"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)} // Update file name state
                            className="ml-5 p-2 border border-gray-300 rounded"
                        />
                        <button
                            onClick={saveAsPdfAndUpload}
                            disabled={saving}
                            className="m-4 p-2 rounded bg-teal-400 text-white font-semibold cursor-pointer disabled:opacity-50 duration-100 hover:scale-105 active:scale-90"
                        >
                            {saving ? "Saving..." : "Save as PDF"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
