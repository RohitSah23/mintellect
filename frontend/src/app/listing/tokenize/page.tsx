
"use client";
import React, { useState } from "react";
import axios from "axios";
import "./style.css";
import { useSearchParams } from "next/navigation";

export default function TokenizePage() {
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState("");
    const searchParams = useSearchParams();
    const ipId = searchParams.get("id");

    const handleMint = async () => {
        setIsMinting(true);
        setMintStatus("");
        try {
            if (!ipId) {
                setMintStatus("No IP ID provided in URL.");
                setIsMinting(false);
                return;
            }
            // Call backend mint API with the IP id
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/mint`,
                { ip_id: ipId },
                { withCredentials: true }
            );
            setMintStatus("Mint successful! Your IP has been tokenized.");
        } catch (err: any) {
            setMintStatus(err?.response?.data?.error || "Mint failed. Please try again or contact support.");
        }
        setIsMinting(false);
    };

    return (
        <div className="mint-container">
            <h1 className="mint-title">Tokenize Your Intellectual Property</h1>
            <p className="mint-desc">
                {ipId
                    ? `Click the button below to mint and tokenize your IP (ID: ${ipId}) on-chain.`
                    : "No IP ID found in URL. Please use a valid link."}
            </p>
            <button
                className="mint-btn"
                onClick={handleMint}
                disabled={isMinting || !ipId}
            >
                {isMinting ? "Minting..." : "Mint"}
            </button>
            {mintStatus && (
                <div className={`mint-status ${mintStatus.includes("success") ? "success" : "error"}`}>{mintStatus}</div>
            )}
        </div>
    );
}
