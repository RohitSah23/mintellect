"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import UserDashboard from "@/components/dashboard/user";
import VerifierDashboard from "@/components/dashboard/verifier";

export default function App() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <>
            {user?.role === 'patent-owner' && <UserDashboard />}
            {user?.role === 'verifier' && <VerifierDashboard />}
        </>
    );
}