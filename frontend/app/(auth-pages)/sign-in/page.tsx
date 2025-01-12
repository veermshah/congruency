import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
    const searchParams = await props.searchParams;
    return (
        <>
            <form className="flex flex-col mx-auto">
                <h1 className="text-4xl text-teal-400 font-bold text-center">
                    Login
                </h1>
                <p className="mt-2 text-center text-xl text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        className="duration-500 text-teal-400 hover:font-bold"
                        href="/sign-up"
                    >
                        Sign up
                    </Link>
                </p>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            className="text-xs text-foreground underline"
                            href="/forgot-password"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Your password"
                        minLength={6}
                        required
                    />
                    <SubmitButton
                        pendingText="Logging In..."
                        formAction={signInAction}
                    >
                        Login
                    </SubmitButton>
                    <FormMessage message={searchParams} />
                </div>
            </form>
        </>
    );
}
