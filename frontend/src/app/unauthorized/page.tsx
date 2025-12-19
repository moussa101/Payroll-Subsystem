
"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
            <div className="mb-8 rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-500" />
            </div>

            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Access Denied
            </h1>

            <p className="mb-8 max-w-[500px] text-muted-foreground">
                You do not have permission to access this page. If you believe this is a
                mistake, please contact your system administrator or the HR department.
            </p>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
                <Link href="/">
                    <Button>Return to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
