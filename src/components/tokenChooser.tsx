"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import Button from "./button"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { Mint, Token } from "@metaplex-foundation/mpl-toolbox";
import { Metadata, TokenStandard } from "@metaplex-foundation/mpl-token-metadata"
import Image from "next/image"
import { MdImageNotSupported } from "react-icons/md";
import { GetTokens } from "@/helpers/getTokens"
import { GetWalletString } from "@/helpers/getWalletString"

export type BuiltToken = {
    mint: Mint,
    token?: Token,
    metadata?: Metadata,
    image: string,
}

export type TokenChooserProps = {
    onChoose: (token: BuiltToken) => void,
    allowedStandards?: TokenStandard[]
    reloadTrigger?: number
}

export default function TokenChooser({ onChoose, allowedStandards, reloadTrigger }: TokenChooserProps) {
    const wallet = useWallet()
    const [showModal, setShowModal] = useState(false)
    const [tokens, setTokens] = useState<BuiltToken[]>()
    const [fetchingTokens, setFetchingTokens] = useState(false)
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const className = wallet.publicKey ? "cursor-pointer" : "cursor-not-allowed"

    const handleClick = () => {
        if (wallet.publicKey && tokens && tokens.length > 0 && !fetchingTokens) {
            setShowModal(true)
        }
    }

    useEffect(() => {
        if (wallet.publicKey) {
            fetchMints()
            setSelectedToken(undefined)
        } else {
            setSelectedToken(undefined)
        }
    }, [wallet.publicKey, reloadTrigger])

    const fetchMints = async () => {
        setFetchingTokens(true)
        const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
        umi.use(walletAdapterIdentity(wallet));

        let fetchedTokens = await GetTokens(umi, allowedStandards)

        if (allowedStandards) { 
            fetchedTokens = fetchedTokens.filter(x => x.metadata &&
                x.metadata.tokenStandard.__option == "Some" &&
                allowedStandards.includes(x.metadata.tokenStandard.value)
            )
        }

        setTokens(fetchedTokens)
        setFetchingTokens(false)
    }

    const handleChoose = (token: BuiltToken) => {
        onChoose(token)
        setSelectedToken(token)
        setShowModal(false)
    }

    return <>
        {showModal && <div style={{ zIndex: 500 }} className="flex justify-center items-center fixed bg-[#000000c1] h-screen w-screen top-0 left-0">

            <div className="flex flex-col bg-red-900 p-8 max-h-[90%] overflow-auto gap-2 rounded">
                <div className="text-2xl font-bold self-center">Choose token</div>
                {tokens?.map((t, i) => {
                    return <div className="flex gap-2 p-4 bg-red-500 items-center rounded cursor-pointer" onClick={() => handleChoose(t)} key={i}>
                        {(t.image && t.image.trim() != "") ? <Image alt="image" width={50} height={50} src={t.image}></Image> : <div className="flex justify-center items-center bg-black h-[50px] w-[50px] rounded-lg text-center"><MdImageNotSupported size={20}/></div>}
                        <div className="flex flex-col">
                        <div className="flex gap-2 items-center">
                            <div className="font-bold">
                                {t.metadata ? t.metadata.symbol : "N/A"}
                            </div>
                            <div className="text-sm">
                                {t.metadata ? t.metadata.name : "N/A"}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="font-light text-sm">
                                <span className="font-bold">CA:</span> {GetWalletString(t.mint.publicKey.toString())}
                            </div>
                        </div>
                        </div>
                        
                        
                    </div>
                })}
                <div className="flex gap-2 self-center">
                    <Button title="Close" onClick={() => setShowModal(false)} />
                </div>
            </div>
        </div>}
        <div className="flex flex-col gap-2">
            <div className="font-bold"><span className="text-red-300">*</span>Token:</div>
            <div className={"w-full bg-red-900 text-white outline-none px-4 py-2 rounded " + className} onClick={handleClick}>
                {!selectedToken && !wallet.publicKey && "Please connect wallet"}
                {!selectedToken && wallet.publicKey && tokens && tokens.length > 0 && !fetchingTokens && "Choose token"}
                {!selectedToken && wallet.publicKey && fetchingTokens && "Fetching tokens"}
                {!selectedToken && wallet.publicKey && !fetchingTokens && (!tokens || tokens.length == 0) && "No tokens found"}
                {selectedToken && wallet.publicKey && <div className="flex gap-2 items-center">
                    {(selectedToken.image && selectedToken.image.trim() != "") ? <Image alt="image" width={50} height={50} src={selectedToken.image}></Image> : <div className="flex justify-center items-center bg-black h-[50px] w-[50px] rounded-lg text-center"><MdImageNotSupported size={20}/></div>}
                    <div className="flex flex-col">
                        <div className="flex gap-2 items-center">
                            <div className="font-bold">
                                {selectedToken.metadata ? selectedToken.metadata.symbol : "N/A"}
                            </div>
                            <div className="text-sm">
                                {selectedToken.metadata ? selectedToken.metadata.name : "N/A"}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="font-light text-sm">
                                <span className="font-bold">CA:</span> {GetWalletString(selectedToken.mint.publicKey.toString())}
                            </div>
                        </div>
                        </div>
                </div>}
            </div>
        </div>
    </>
}