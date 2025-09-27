// Transaction Details Page for Minted IP
'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import './style.css';

interface TxReceipt {
    to: string;
    from: string;
    contractAddress: string | null;
    hash: string;
    blockHash: string;
    blockNumber: number;
    gasUsed: { $numberLong: string };
    cumulativeGasUsed: { $numberLong: string };
    gasPrice: { $numberLong: string };
    type: number;
    status: number;
}

interface TxInfo {
    ip_id: string;
    tokenId: string;
    tokenUri: string;
    txHash: string;
    txReceipt: TxReceipt;
    mintedBy: string;
    mintedAt: number;
}

export default function TxInfoPage() {
    const searchParams = useSearchParams();
    const ip_id = searchParams.get('id');
    const [txInfo, setTxInfo] = useState<TxInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!ip_id) return;
        setLoading(true);
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/tx-info/${ip_id}`)
            .then(res => {
                const data = res.data;
                console.log(data);
                if (data && data.data) setTxInfo(data.data);
                else setError('No transaction found.');
            })
            .catch(() => setError('Failed to fetch transaction info.'))
            .finally(() => setLoading(false));
    }, [ip_id]);

    if (!ip_id) return <div className="tx-info-container"><p>Invalid request: No IP ID provided.</p></div>;
    if (loading) return <div className="tx-info-container"><p>Loading...</p></div>;
    if (error) return <div className="tx-info-container error"><p>{error}</p></div>;
    if (!txInfo) return <div className="tx-info-container"><p>No transaction found.</p></div>;

    const { tokenId, tokenUri, txHash, txReceipt, mintedBy, mintedAt } = txInfo;

    return (
        <div className="tx-info-container">
            <div className="tx-card">
                <h2>Tokenization Transaction Details</h2>
                <div className="tx-row"><span className="tx-label">IP ID:</span> <span>{ip_id}</span></div>
                <div className="tx-row"><span className="tx-label">Token ID:</span> <span>{tokenId}</span></div>
                <div className="tx-row"><span className="tx-label">Token URI:</span> <a href={tokenUri} target="_blank" rel="noopener noreferrer">View Metadata</a></div>
                <div className="tx-row"><span className="tx-label">Tx Hash:</span> <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a></div>
                <div className="tx-row"><span className="tx-label">From:</span> <span>{txReceipt?.from}</span></div>
                <div className="tx-row"><span className="tx-label">To (Contract):</span> <span>{txReceipt?.to}</span></div>
                <div className="tx-row"><span className="tx-label">Block Number:</span> <span>{txReceipt?.blockNumber}</span></div>
                <div className="tx-row"><span className="tx-label">Status:</span> <span className={txReceipt?.status === 1 ? 'success' : 'fail'}>{txReceipt?.status === 1 ? 'Success' : 'Failed'}</span></div>
                <div className="tx-row"><span className="tx-label">Minted By:</span> <span>{mintedBy}</span></div>
                <div className="tx-row"><span className="tx-label">Minted At:</span> <span>{new Date(mintedAt).toLocaleString()}</span></div>
            </div>
        </div>
    );
}
