"use client"

import { useEffect, useState } from "react"
import Button from "./button"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata"
import { none, publicKey, sol, some } from "@metaplex-foundation/umi"
import { transferSol, setAuthority, AuthorityType, setComputeUnitPrice } from "@metaplex-foundation/mpl-toolbox";
import TokenChooser, { BuiltToken } from "./tokenChooser"
import { useToast } from "./Toast/toastService"
import SuccessToast from "./Toast/successToast"
import ErrorToast from "./Toast/errorToast"
import { usePriorityFee } from "./PriorityFees/priorityFeeService"
import { SendAndConfirm } from "@/helpers/sendAndConfirm"


export default function RevokeMintForm() {
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const [isLoading, setIsLoading] = useState(false)
    const wallet = useWallet()
    const { connection } = useConnection()
    const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
    umi.use(walletAdapterIdentity(wallet));
    umi.use(mplCandyMachine())

    const isDifferentAuthority = selectedToken && selectedToken.mint.mintAuthority.__option != "None" && selectedToken.mint.mintAuthority.__option == "Some" && selectedToken.mint.mintAuthority.value != umi.identity.publicKey
    const isRevokedAuthority = selectedToken && selectedToken.mint.mintAuthority.__option == "None"

    const disabled = isLoading || !selectedToken || isDifferentAuthority || isRevokedAuthority
    const { priority } = usePriorityFee()
    const buttonTitle = isLoading ? "Revoking mint" : "Revoke mint"
    const toast = useToast()
    const startRevokeMint = async () => {
        try {
            setIsLoading(true)
            if (wallet.publicKey && selectedToken) {
                if (await connection.getBalance(wallet.publicKey) < 0.001 * 10 ** 9) {
                    setIsLoading(false)
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
            setIsLoading(false)
            toast.open(
                <SuccessToast title="Success" message={`Mint on token ${selectedToken?.metadata ? selectedToken.metadata.name : "N/A"} successfully revoked!`} />
            )
        } catch (error: any) {
            setIsLoading(false)
            toast.open(
                <ErrorToast title="Error" message={error.toString()} />
            )
        }
    }

    const onChoose = (token: BuiltToken) => {
        setSelectedToken(token)
    }

    return <div className="w-[600px] flex flex-col gap-4 max-w-[90%]">
        <TokenChooser allowedStandards={[TokenStandard.Fungible]} onChoose={onChoose} />
        {isRevokedAuthority && <div className="self-center text-yellow-500">Mint is revoked on this token</div>}
        {isDifferentAuthority && <div className="self-center text-yellow-500">Connected wallet is not the mint authority</div>}
        <div className="self-center">{wallet.publicKey ? <Button isLoading={isLoading} disabled={disabled} title={buttonTitle} onClick={startRevokeMint} /> : <WalletMultiButton />}</div>
        <div className="text-sm text-center text-gray-400">platform fee: <span className="font-bold">0.001 SOL</span></div>
    </div>
}