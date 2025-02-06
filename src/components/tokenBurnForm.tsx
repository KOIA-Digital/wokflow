"use client"

import { useState } from "react"
import FormInputNumber from "./formInputNumber"
import Button from "./button"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { publicKey } from "@metaplex-foundation/umi"
import { BurnTokenInstructionAccounts, BurnTokenInstructionDataArgs, burnToken, closeToken } from "@metaplex-foundation/mpl-toolbox";
import TokenChooser, { BuiltToken } from "./tokenChooser"
import { useToast } from "./Toast/toastService"
import SuccessToast from "./Toast/successToast"
import ErrorToast from "./Toast/errorToast"
import { usePriorityFee } from "./PriorityFees/priorityFeeService"
import { SendAndConfirm } from "@/helpers/sendAndConfirm"
import { GetTokenAccount } from "@/helpers/getTokenAccount"

export default function TokenBurnForm() {
    const [amount, setAmount] = useState<number>(0)
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const [isLoading, setIsLoading] = useState(false)
    const [reloadTrigger, setReloadTrigger] = useState(0)
    const wallet = useWallet()
    const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
    umi.use(walletAdapterIdentity(wallet));
    umi.use(mplCandyMachine())

    const selectedTokenBalance = selectedToken && selectedToken.token && Number(selectedToken.token.amount)
    const { connection } = useConnection()

    const disabled = isLoading || !selectedToken || isNaN(amount) || amount <= 0
    const { priority } = usePriorityFee()

    const buttonTitle = isLoading ? "Burning" : "Burn"
    const toast = useToast()
    const startBurn = async () => {
        try {
            setIsLoading(true)
            if (selectedToken) {
                const accounts: BurnTokenInstructionAccounts = {
                    account: publicKey(GetTokenAccount(selectedToken.mint.publicKey.toString(), umi.identity.publicKey.toString())),
                    mint: selectedToken.mint.publicKey
                }
                const data: BurnTokenInstructionDataArgs = {
                    amount: Math.round(amount * 10 ** selectedToken.mint.decimals)
                }

                let tb = burnToken(umi, { ...accounts, ...data })

                if (Math.round(amount * 10 ** selectedToken.mint.decimals) == Number(selectedToken.token?.amount)) {
                    tb = tb.add(closeToken(umi, {
                        account: publicKey(GetTokenAccount(selectedToken.mint.publicKey.toString(), umi.identity.publicKey.toString())),
                        destination: umi.identity.publicKey,
                        owner: umi.identity
                    }))
                }
                const res = await SendAndConfirm(tb, umi, priority, connection);
            }
            setIsLoading(false)
            toast.open(
                <SuccessToast title="Burn successful!" message={`Succesfully burned ${amount} ${selectedToken?.metadata?.symbol}!`} />
            )
            setTimeout(() => setReloadTrigger(reloadTrigger + 1), 1000)
            setAmount(0)
            setSelectedToken(undefined)
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
        <TokenChooser reloadTrigger={reloadTrigger} onChoose={onChoose} />

        <div className="flex flex-col sm:flex-row gap-2 items-end">
            <FormInputNumber value={amount} onChange={(x) => { setAmount(x.target.valueAsNumber) }} name="Amount" mandatory={true} />
        </div>
        <div className="flex flex-col justify-center gap-2">
            {selectedToken && selectedTokenBalance &&
                <div className="flex gap-2 cursor-pointer" onClick={() => setAmount(selectedTokenBalance / 10 ** selectedToken.mint.decimals)}>
                    <div className="text-sm">
                        max. <b>{selectedTokenBalance / 10 ** selectedToken.mint.decimals} {selectedToken.metadata?.symbol}</b>
                    </div>
                </div>}
            <div className="self-center">{wallet.publicKey ? <Button isLoading={isLoading} disabled={disabled} title={buttonTitle} onClick={startBurn} /> : <WalletMultiButton />}</div>
        </div>
    </div>
}