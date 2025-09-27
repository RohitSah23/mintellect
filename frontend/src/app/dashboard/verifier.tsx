"use client";
import { useRouter } from "next/navigation";
import "./style.css";
import IpTable from "@/components/ipTable";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import IpCard from "../ip-card";

export default function VerifierDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [ipData, setIpData] = useState<any[]>([])
    useEffect(() => {
        async function getIps() {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/getipbyorg/${user?.org_id}`,
                {
                    withCredentials: true,
                }
            );
            setIpData(response.data.data)
            console.log(response.data)
        }
        if (user?.org_id !== undefined) getIps();
    }, [user])

    // Sample data for demonstration

    return (
        <div className="app-container">
            <div className="page-header">
                <h1 className="page-title">Intellectual Property Dashboard</h1>
            </div>
            <IpTable ipdata={ipData} />
        </div>
    );
}