"use client"

import { useEffect, useState } from "react"
import Button from "./button"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { TokenStandard, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, fetchMetadataFromSeeds, findMetadataPda, mintV1, updateMetadataAccountV2 } from "@metaplex-foundation/mpl-token-metadata"
import { PublicKey, none, publicKey, sol, some } from "@metaplex-foundation/umi"
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import TokenChooser, { BuiltToken } from "./tokenChooser"
import { useToast } from "./Toast/toastService"
import SuccessToast from "./Toast/successToast"
import ErrorToast from "./Toast/errorToast"
import { usePriorityFee } from "./PriorityFees/priorityFeeService"
import { SendAndConfirm } from "@/helpers/sendAndConfirm"

export default function RevokeUpdateForm() {
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const [isLoading, setIsLoading] = useState(false)
    const wallet = useWallet()
    const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
    umi.use(walletAdapterIdentity(wallet));
    umi.use(mplCandyMachine())
    const {connection} = useConnection()
    const isImmutable = selectedToken && !selectedToken.metadata?.isMutable
    const disabled = isLoading || !selectedToken || isImmutable

    const buttonTitle = isLoading ? "Revoking update" : "Revoke update"
    const toast = useToast()
    const {priority} = usePriorityFee()
    const startRevokeUpdate = async () => {
        try {
            setIsLoading(true)
            if (wallet.publicKey && selectedToken) {
                if (await connection.getBalance(wallet.publicKey) < 0.001 * 10**9){
                    setIsLoading(false)
                    toast.open(
                        <ErrorToast title="Error" message="You need at least 0.001 SOL on your wallet" />
                    )
                    return
                }
                const initialMetadata = await fetchMetadataFromSeeds(umi, {
                    mint: selectedToken.mint.publicKey,
                });
                const data: UpdateMetadataAccountV2InstructionData = {
                    data: some({ ...initialMetadata}),
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
            setIsLoading(false)
            toast.open(
                <SuccessToast title="Success" message={`Update on token ${selectedToken?.metadata ? selectedToken.metadata.name : "N/A"} successfully revoked!`} />
            )
        } catch (error:any) {
            setIsLoading(false)
            toast.open(
                <ErrorToast title="Error" message={error.toString()}/>
            )
        }
    }

    const onChoose = (token:BuiltToken) => {
        setSelectedToken(token)
    }

    return <div className="w-[600px] flex flex-col gap-4 max-w-[90%]">
        <TokenChooser allowedStandards={[TokenStandard.Fungible]} onChoose={onChoose}/>
        {isImmutable && <div className="self-center text-yellow-500">This token is already immutable</div>}
        <div className="self-center">{wallet.publicKey ? <Button isLoading={isLoading} disabled={disabled} title={buttonTitle} onClick={startRevokeUpdate} /> : <WalletMultiButton/>}</div>
        <div className="text-sm text-center text-gray-400">platform fee: <span className="font-bold">0.001 SOL</span></div>
    </div>
}