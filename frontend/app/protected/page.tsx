import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { IoCloudUploadSharp } from "react-icons/io5";
import { RiAiGenerate } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoDocuments } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log("User Details:", JSON.stringify(user, null, 2));

    if (!user) {
        return redirect("/sign-in");
    }
    // User Details: JSON.stringify(user, null, 2)

    return (
        <div className="absolute left-0 top-20">
            <div className="mt-5 mx-16">
                <div className="text-3xl text-teal-400 font-bold mb-8">
                    Contracts
                </div>
                <div className="flex items-center gap-10">
                    <Link
                        href="/protected/upload"
                        className="flex items-center gap-3 text-xl rounded-3xl hover:text-teal-400 border-black border-1 shadow-xl px-8 py-5 hover:scale-105 active:scale-90 duration-500 cursor-pointer"
                    >
                        <IoCloudUploadSharp size={40} />
                        Upload
                    </Link>
                    <Link
                        href="/protected/ai"
                        className="flex items-center gap-3 text-xl rounded-3xl hover:text-teal-400 border-black border-1 shadow-xl px-8 py-5 hover:scale-105 active:scale-90 duration-500 cursor-pointer"
                    >
                        <RiAiGenerate size={40} />
                        Create with AI
                    </Link>
                </div>
                <div className="text-3xl text-teal-400 font-bold mt-10 mb-8">
                    Documents
                </div>
                <div className="flex items-center gap-10">
                    <Link
                        href="/protected/view"
                        className="flex items-center gap-3 text-xl rounded-3xl hover:text-teal-400 border-black border-1 shadow-xl px-8 py-5 hover:scale-105 active:scale-90 duration-500 cursor-pointer"
                    >
                        <IoDocuments size={40} />
                        View Your Documents
                    </Link>
                    <Link
                        href="/protected/reminders"
                        className="flex items-center gap-3 text-xl rounded-3xl hover:text-teal-400 border-black border-1 shadow-xl px-8 py-5 hover:scale-105 active:scale-90 duration-500 cursor-pointer"
                    >
                        <IoIosNotifications size={40} />
                        View Your Reminders
                    </Link>
                </div>
            </div>
        </div>
    );
}
