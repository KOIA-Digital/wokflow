"use client"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"

import { ReactNode, useMemo } from "react"
import PriorityFeeChooser from "./priorityFeeChooser"
require('@solana/wallet-adapter-react-ui/styles.css');

export type WalletProps = {
    children: ReactNode
}

export default function Wallet({ children }: WalletProps) {
    // const network = WalletAdapterNetwork.Devnet;
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = process.env.NEXT_PUBLIC_RPC_URI ?? "";

    const wallets = useMemo(
        () => [
        ],
        [network]
    );
    return <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <div style={{zIndex: 500}} className="flex gap-2 w-full bg-[#210b0b] fixed top-0 right-0 p-2 justify-end items-start">
                    <PriorityFeeChooser />
                    <WalletMultiButton/>
                </div>
                {children}
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
}