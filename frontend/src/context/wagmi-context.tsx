'use client'

import { wagmiAdapter, projectId } from '@/config/wagmi-config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, avalanche, avalancheFuji } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'appkit-example',
    description: 'AppKit Example',
    url: 'http:localhost:3001', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
createAppKit({
    themeMode: "light",
    adapters: [wagmiAdapter],
    projectId,
    networks: [avalanche, avalancheFuji],
    defaultNetwork: avalancheFuji,
    metadata: metadata,
    features: {
        connectMethodsOrder: ['wallet', 'email', 'social'],
        analytics: true // Optional - defaults to your Cloud configuration
    },
    defaultAccountTypes: { eip155: 'eoa' }
})

function WagmiContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default WagmiContextProvider