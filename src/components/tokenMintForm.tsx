"use client"

import { useState } from "react"
import FormInputNumber from "./formInputNumber"
import Button from "./button"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { TokenStandard, mintV1 } from "@metaplex-foundation/mpl-token-metadata"
import { publicKey, sol } from "@metaplex-foundation/umi"
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import TokenChooser, { BuiltToken } from "./tokenChooser"
import { useToast } from "./Toast/toastService"
import SuccessToast from "./Toast/successToast"
import ErrorToast from "./Toast/errorToast"
import { usePriorityFee } from "./PriorityFees/priorityFeeService"
import { SendAndConfirm } from "@/helpers/sendAndConfirm"

export default function TokenMintForm() {
    const [amount, setAmount] = useState<number>(0)
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const [isLoading, setIsLoading] = useState(false)
    const wallet = useWallet()
    const {connection} = useConnection()
    const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
    umi.use(walletAdapterIdentity(wallet));
    umi.use(mplCandyMachine())

    const toast = useToast()

    const isDifferentAuthority = selectedToken && selectedToken.mint.mintAuthority.__option != "None" && selectedToken.mint.mintAuthority.__option == "Some" && selectedToken.mint.mintAuthority.value != umi.identity.publicKey
    const isRevokedAuthority = selectedToken && selectedToken.mint.mintAuthority.__option == "None"

    const disabled = isLoading || !selectedToken || isDifferentAuthority || isRevokedAuthority || isNaN(amount) || amount <= 0

    const buttonTitle = isLoading ? "Minting" : "Mint"

    const {priority} = usePriorityFee()

    const startMint = async () => {
        try {
            setIsLoading(true)
            if (wallet.publicKey && selectedToken){
                if (await connection.getBalance(wallet.publicKey) < 0.01 * 10**9){
                    setIsLoading(false)
                    toast.open(
                        <ErrorToast title="Error" message="You need at least 0.001 SOL on your wallet" />
                    )
                    return
                }

                let tb = mintV1(umi, {
                    mint: selectedToken.mint.publicKey,
                    tokenStandard: TokenStandard.Fungible,
                    amount: Math.round(amount * 10 ** selectedToken.mint.decimals),
                    authority: umi.identity,
                })
                    tb = tb.prepend(
                        transferSol(umi, {
                            destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                            amount: sol(Number(0.001)),
                        }))
                const res = await SendAndConfirm(tb, umi, priority, connection);
                if (res) {
                    toast.open(
                        <SuccessToast title="Mint successful!" message={`Succesfully minted ${amount} ${selectedToken?.metadata?.symbol}!`}/>
                    )
                    setIsLoading(false)
                }
            }
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
        {isRevokedAuthority && <div className="self-center text-yellow-500">Mint is revoked on this token</div>}
        {isDifferentAuthority &&  <div className="self-center text-yellow-500">Connected wallet is not the mint authority</div>}
        <FormInputNumber value={amount} onChange={(x) => {setAmount(x.target.valueAsNumber)}} name="Amount" mandatory={true} />
        <div className="self-center">{wallet.publicKey ? <Button isLoading={isLoading} disabled={disabled} title={buttonTitle} onClick={startMint} /> : <WalletMultiButton/>}</div>
        <div className="text-sm text-center text-gray-400">platform fee: <span className="font-bold">0.01 SOL</span></div>
    </div>
}