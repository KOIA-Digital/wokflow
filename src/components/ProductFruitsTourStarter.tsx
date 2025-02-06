'use client'

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Button from "./button";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import { GiWok } from "react-icons/gi";
import { fetchMetadataFromSeeds, findMetadataPda, TokenStandard, updateMetadataAccountV2, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData } from "@metaplex-foundation/mpl-token-metadata"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { BuiltToken } from "./tokenChooser";
import { GetTokens } from "@/helpers/getTokens";
import Image from "next/image"
import { useToast } from "./Toast/toastService";
import ErrorToast from "./Toast/errorToast";
import { transferSol, setAuthority, AuthorityType } from "@metaplex-foundation/mpl-toolbox";
import { PublicKey, none, publicKey, sol, some } from "@metaplex-foundation/umi";
import { SendAndConfirm } from "@/helpers/sendAndConfirm";
import { usePriorityFee } from "./PriorityFees/priorityFeeService";
import SuccessToast from "./Toast/successToast";
import { useRouter } from "next/navigation";

export default function ProductFruitsTourStarter({ tourId }: { tourId: number }) {
    const wallet = useWallet()
    const { connection } = useConnection()
    const [tokens, setTokens] = useState<BuiltToken[]>([])
    const [isRevokingMint, setIsRevokingMint] = useState(false);
    const [isRevokingFreeze, setIsRevokingFreeze] = useState(false);
    const [isRevokingUpdate, setIsRevokingUpdate] = useState(false);
    const navigate = useRouter()

    const { priority } = usePriorityFee()

    const toast = useToast()

    const fetchTokens = async () => {
        const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
        umi.use(walletAdapterIdentity(wallet));
        const fetchedTokens = await GetTokens(umi)
        const filtered = fetchedTokens.filter((x) => x.metadata &&
            x.metadata.tokenStandard.__option == "Some" &&
            (x.metadata.tokenStandard.value == TokenStandard.Fungible ||
                x.metadata.tokenStandard.value == TokenStandard.FungibleAsset) &&
            x.metadata.updateAuthority.toString() == wallet.publicKey?.toString())
        setTokens(filtered)
    }

    const startRevokeMint = async (selectedToken: BuiltToken) => {
        try {
            setIsRevokingMint(true)
            if (wallet.publicKey && selectedToken) {
                const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
                umi.use(walletAdapterIdentity(wallet));
                if (await connection.getBalance(wallet.publicKey) < 0.001 * 10 ** 9) {
                    setIsRevokingMint(false)
                    toast.open(
                        <ErrorToast title="Error" message="You need at least 0.001 SOL on your wallet" />
                    )
                    return
                }
                let tb = setAuthority(umi, {
                    owned: selectedToken.mint.publicKey,
                    owner: umi.identity,
                    authorityType: AuthorityType.MintTokens,
                    newAuthority: none(),
                })

                tb = tb.prepend(
                    transferSol(umi, {
                        destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                        amount: sol(Number(0.001)),
                    }))
                const res = await SendAndConfirm(tb, umi, priority, connection)
            }
            setTimeout(async () => {
                await fetchTokens()
                setIsRevokingMint(false)
                toast.open(
                    <SuccessToast title="Success" message={`Mint on token ${selectedToken?.metadata?.name} successfully revoked!`} />
                )
            }, 1000)
        } catch (error: any) {
            setIsRevokingMint(false)
            toast.open(
                <ErrorToast title="Error" message={error.toString()} />
            )
        }
    }

    const startRevokeFreeze = async (selectedToken: BuiltToken) => {
        try {
            setIsRevokingFreeze(true)
            if (wallet.publicKey && selectedToken) {
                const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
                umi.use(walletAdapterIdentity(wallet));
                if (await connection.getBalance(wallet.publicKey) < 0.001 * 10 ** 9) {
                    setIsRevokingFreeze(false)
                    toast.open(
                        <ErrorToast title="Error" message="You need at least 0.001 SOL on your wallet" />
                    )
                    return
                }
                let tb = setAuthority(umi, {
                    owned: selectedToken.mint.publicKey,
                    owner: umi.identity,
                    authorityType: AuthorityType.FreezeAccount,
                    newAuthority: none(),
                })

                tb = tb.prepend(
                    transferSol(umi, {
                        destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                        amount: sol(Number(0.001)),
                        }))
                
                const res = await SendAndConfirm(tb, umi, priority, connection)
            }
            setTimeout(async () => {
                await fetchTokens()
                setIsRevokingFreeze(false)
                toast.open(
                    <SuccessToast title="Success" message={`Freeze on token ${selectedToken?.metadata?.name} successfully revoked!`} />
                )
            }, 1000)
        } catch (error: any) {
            setIsRevokingFreeze(false)
            toast.open(
                <ErrorToast title="Error" message={error.toString()} />
            )
        }
    }

    const startRevokeUpdate = async (selectedToken: BuiltToken) => {
        try {
            setIsRevokingUpdate(true)
            if (wallet.publicKey && selectedToken) {
                const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
                umi.use(walletAdapterIdentity(wallet));
                if (await connection.getBalance(wallet.publicKey) < 0.001 * 10 ** 9) {
                    setIsRevokingUpdate(false)
                    toast.open(
                        <ErrorToast title="Error" message="You need at least 0.001 SOL on your wallet" />
                    )
                    return
                }
                const initialMetadata = await fetchMetadataFromSeeds(umi, {
                    mint: selectedToken.mint.publicKey,
                });
                const data: UpdateMetadataAccountV2InstructionData = {
                    data: some({ ...initialMetadata }),
                    discriminator: 0,
                    isMutable: some(false),
                    newUpdateAuthority: none<PublicKey>(),
                    primarySaleHappened: none<boolean>()
                }
                const accounts: UpdateMetadataAccountV2InstructionAccounts = {
                    metadata: findMetadataPda(umi, { mint: selectedToken.mint.publicKey }),
                    updateAuthority: umi.identity
                }
                let tb = updateMetadataAccountV2(umi, { ...accounts, ...data })
                tb = tb.prepend(
                    transferSol(umi, {
                        destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                        amount: sol(Number(0.001)),
                    }))


                const res = await SendAndConfirm(tb, umi, priority, connection)
            }
            setTimeout(async () => {
                await fetchTokens()
                setIsRevokingUpdate(false)
                toast.open(
                    <SuccessToast title="Success" message={`Update on token ${selectedToken?.metadata?.name} successfully revoked!`} />
                )
            }, 1000)

        } catch (error: any) {
            setIsRevokingUpdate(false)
            toast.open(
                <ErrorToast title="Error" message={error.toString()} />
            )
        }
    }

    useEffect(() => {
        if (wallet.publicKey) {
            fetchTokens()
        }
    }, [wallet.publicKey])

    return (
        <div className="flex flex-col gap-4 rounded-xl justify-between items-center gradient-solana p-6 w-full max-w-[100%]">

            {(!wallet.publicKey) ? <>
                <div className="text-2xl sm:text-3xl font-bold text-center">
                    Create your first token
                </div>
                <div className="text-center">
                    Don&apos;t waste your time looking for the next 1000x token. Build one!<br />Start by connecting your wallet through the button below.
                </div>
                <div className="flex gap-2">
                    <WalletMultiButton />
                </div>
            </>
                : tokens.length <= 0 ?
                    <>
                        <div className="text-2xl sm:text-3xl font-bold text-center">
                            Create your first token
                        </div>
                        <div className="text-center">
                            What are you waiting for?<br /> Press the button below and let&apos;s start cooking
                        </div>
                        <div className="flex gap-2">
                            <Button icon={<GiWok size={20} />} variant="white" onClick={() => navigate.push('token')} title="Start cooking"></Button>
                        </div>
                    </>
                    :
                    <>
                        <div className="text-2xl sm:text-3xl font-bold text-center">
                            Your Tokens
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            {tokens.map((x, i) => {
                                return <div className="flex gap-2 bg-black/30 p-4 rounded w-full items-center" key={i}>
                                    <Image width={100} height={100} src={x.image} alt={"tokenPicture"}></Image>
                                    <div className="flex justify-between w-full h-full">

                                        <div className="flex flex-col justify-between h-full">
                                            <div className="font-bold text-xl">{x.metadata?.symbol ?? "N/A"} <span className="text-sm font-light">{x.metadata?.name}</span></div>
                                            <div className="flex flex-col">
                                                <div className="font-light text-sm">{x.mint.mintAuthority.__option === "None" ? "Max supply" : "Current supply"}</div>
                                                <div className="bg-black/30 py-1 px-2 rounded text-center w-max">{Number(x.mint.supply) / 10 ** x.mint.decimals}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-2 flex-col justify-center">
                                            <div className="font-light text-sm">{x.mint.mintAuthority.__option === "None" ? <div className="text-lime-300">Mint revoked</div> : <Button onClick={() => startRevokeMint(x)} isLoading={isRevokingMint} disabled={isRevokingMint} variant="sm-white">Revoke Mint</Button>}</div>
                                            <div className="font-light text-sm">{x.mint.freezeAuthority.__option === "None" ? <div className="text-lime-300">Freeze revoked</div> : <Button onClick={() => startRevokeFreeze(x)} isLoading={isRevokingFreeze} disabled={isRevokingFreeze} variant="sm-white">Revoke Freeze</Button>}</div>
                                            <div className="font-light text-sm">{!x.metadata?.isMutable ? <div className="text-lime-300">Immutable</div> : <Button onClick={() => startRevokeUpdate(x)} isLoading={isRevokingUpdate} disabled={isRevokingUpdate} variant="sm-white">Make Immutable</Button>}</div>
                                        </div>
                                    </div>

                                </div>
                            })}
                        </div>
                    </>
            }
        </div>
    )
}