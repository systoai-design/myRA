import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, LockKeyhole } from "lucide-react";

// The auth flow gives us a recovery session; we just need a new password
const resetSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Verify we actually have a session (user clicked email link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setError("It looks like this reset link is invalid or has expired. Please request a new one.");
            }
        });
    }, []);

    const form = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Password updated successfully!");
            // Redirect them back to the app (e.g. agent chat or homepage)
            navigate("/agent-chat");
        } catch (error) {
            toast.error("An error occurred while updating the password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <LockKeyhole className="h-6 w-6 text-blue-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Create New Password</h2>

                    {error ? (
                        <div className="text-center mt-6">
                            <p className="text-red-500 text-sm mb-6">{error}</p>
                            <Button onClick={() => navigate("/")} className="w-full">
                                Return Home
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-500 text-center mb-8 text-sm">
                                Your new password must be different from previous used passwords.
                            </p>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="******" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="******" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Reset Password
                                    </Button>
                                </form>
                            </Form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
