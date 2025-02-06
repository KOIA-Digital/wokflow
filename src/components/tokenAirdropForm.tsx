"use client"

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { mplToolbox, transferTokens, transferSol, setComputeUnitLimit,setComputeUnitPrice, createTokenIfMissing, transferTokensChecked, createAccount } from "@metaplex-foundation/mpl-toolbox";
import { GetTokenAccount } from "@/helpers/getTokenAccount";
import { publicKey, transactionBuilder, generateSigner, signAllTransactions, Transaction, RpcSendTransactionOptions, RpcConfirmTransactionResult, sol  } from "@metaplex-foundation/umi";
import { useState } from "react";
import TokenChooser, { BuiltToken } from "./tokenChooser";
import { usePriorityFee } from "./PriorityFees/priorityFeeService";
import Button from "./button";
import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { getPriorityFeeEstimate } from "@/helpers/getPriorityFeeEstimate";


export type SignatureResult = {signature:string , result:RpcConfirmTransactionResult }

export default function TokenAirdropForm() {
    const wallet = useWallet()
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const [transactionLog, setTransactionLog] = useState<RpcConfirmTransactionResult[]>([])
    const {priority} = usePriorityFee()

    const {connection} = useConnection()

    const send = async() => {
        if (selectedToken) {
            const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
            umi.use(walletAdapterIdentity(wallet));
            umi.use(mplToolbox())
            const confirmResult = async (t:Transaction) =>  {
                    const signature = await umi.rpc.sendTransaction(t);
                    console.log(bs58.encode(signature)) 
                    const result = await umi.rpc.confirmTransaction(signature, { commitment: "finalized",
                        strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash())                        }
                    });
                    return {signature: bs58.encode(signature), result: result}
                }

            const mint = selectedToken.mint.publicKey
            let transactions:Transaction[] = []
            let tb = transactionBuilder()
            let iterator = 0
            for (let index = 0; index < 50; index++) {
                try {
                    const element = generateSigner(umi);
                    tb = tb.add(createTokenIfMissing(umi, {
                        mint: mint,
                        owner: publicKey(element)
                    }))
                    tb = tb.add(transferTokens(umi, {
                        authority: umi.identity,
                        destination: publicKey(GetTokenAccount(mint.toString(), element.publicKey)),
                        source: publicKey(GetTokenAccount(mint.toString(), umi.identity.publicKey.toString())),
                        amount: 1,
                    }))
                    iterator++
                    if (iterator == 7 || index == 50-1) {
                        tb = tb.prepend(
                            transferSol(umi, {
                                destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                                amount: sol(Number(0.0001*(iterator))),
                            }))
                        const tbclone = await tb.add(setComputeUnitLimit(umi, {units: 200_000}))
                            .add(setComputeUnitPrice(umi, {microLamports: 500}))
                            .buildWithLatestBlockhash(umi)
                        const mySerializedTransaction = umi.transactions.serialize(tbclone);
                        console.log(mySerializedTransaction)

                        const versioned = VersionedTransaction.deserialize(mySerializedTransaction)
                        const result = await connection.simulateTransaction(versioned, {
                            replaceRecentBlockhash: true,
                            sigVerify: false
                        })
                        console.log("Result: ", result)
                        const feeEstimate = await getPriorityFeeEstimate(priority, mySerializedTransaction, process.env.NEXT_PUBLIC_RPC_URI ?? "")

                        if (result.value.unitsConsumed) {
                            tb = tb.add(setComputeUnitLimit(umi, {units: Math.round(result.value.unitsConsumed*1.2)}))
                        }
                        if (feeEstimate) {
                            tb = tb.add(setComputeUnitPrice(umi, {microLamports: feeEstimate}))
                        }
                        
                        transactions.push(await tb.buildWithLatestBlockhash(umi))
                        tb = transactionBuilder()
                        iterator = 0
                    }
                    
                } catch (error) {
                    
                }
                
            }

            
            console.log("added")
            
            const res = await signAllTransactions(transactions.map(t => { return {transaction: t, signers: [umi.identity]}}))
            
            const promises:Promise<SignatureResult>[] = []
            
            for (let i = 0; i < res.length; i++) {
                const element = res[i];
                const delay = i*250
                await new Promise(res => setTimeout(res, delay));

                promises.push(new Promise<SignatureResult>(async function(resolve) {
                    let result = await confirmResult(element)
                    resolve(result);
                }))
            }
            const result = await Promise.all(promises)
            console.log(result)
        }
    }

    const onChoose = (token:BuiltToken) => {
        setSelectedToken(token)
    }

    return(<>
    <TokenChooser onChoose={onChoose}/>
    <Button onClick={send}>Send</Button>
    <div>{transactionLog.map((x, i) => {
        console.log(x)
        return <div key={i}>{x.context.slot}</div>
    })}</div>
    </>)
}