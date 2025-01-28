import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Image from "next/image";

export default async function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="duration-1000 font-black text-6xl text-teal-400">
                Unlocking Data in Agreements
            </div>
            <img src="contract.gif" alt="Description" width={500} height={500} className="mb-36"/>
        </div>
    );
}
