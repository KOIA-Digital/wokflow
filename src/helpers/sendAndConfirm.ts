import { TransactionBuilder, Umi } from "@metaplex-foundation/umi";
import { IsDevnet } from "./isDevnet";
import { getPriorityFeeEstimate } from "./getPriorityFeeEstimate";
import { setComputeUnitPrice, setComputeUnitLimit} from "@metaplex-foundation/mpl-toolbox";
import { PriorityLevel } from "@/components/PriorityFees/priorityFeeService";
import { Connection, VersionedTransaction } from "@solana/web3.js";

export async function SendAndConfirm(tb: TransactionBuilder, umi: Umi, priority: PriorityLevel, connection:Connection){
    if (IsDevnet()){
        tb = tb.add(setComputeUnitPrice(umi, { microLamports: 0 })).add(setComputeUnitLimit(umi, { units: 200_000}))
        
        const x = await tb.buildWithLatestBlockhash(umi)
        const mySerializedTransaction = umi.transactions.serialize(x);
        const versioned = VersionedTransaction.deserialize(mySerializedTransaction)
        const result = await connection.simulateTransaction(versioned, {
            replaceRecentBlockhash: true,
            sigVerify: false
        })

        const res = tb.sendAndConfirm(umi, { confirm: { commitment: "finalized" } })
        return res
    } else {
        const tbclone = tb.add(setComputeUnitPrice(umi, { microLamports: 0 })).add(setComputeUnitLimit(umi, { units: 200_000}))
        const builtclone = await tbclone.buildWithLatestBlockhash(umi)
        const mySerializedTransaction = umi.transactions.serialize(builtclone);
        const versioned = VersionedTransaction.deserialize(mySerializedTransaction)
        const result = await connection.simulateTransaction(versioned, {
            replaceRecentBlockhash: true,
            sigVerify: false
        })

        const feeEstimate = await getPriorityFeeEstimate(priority, mySerializedTransaction, process.env.NEXT_PUBLIC_RPC_URI ?? "")
        
        if (feeEstimate && feeEstimate.priorityFeeEstimate) {
            const res = await tb.add(setComputeUnitPrice(umi, { microLamports: feeEstimate.priorityFeeEstimate }))
                .add(setComputeUnitLimit(umi, {
                    units: result.value.unitsConsumed ? Math.round(result.value.unitsConsumed * 1.1) : 200_000
                }))
                .sendAndConfirm(umi, { confirm: { commitment: "finalized" } })
            return res
        } else {
            throw "Fee calculation error"
        }
    }
}