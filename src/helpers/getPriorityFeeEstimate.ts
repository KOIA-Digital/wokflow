import { PriorityLevel } from "@/components/PriorityFees/priorityFeeService";
import bs58 from "bs58";
import { IsDevnet } from "./isDevnet";

export async function getPriorityFeeEstimate(priorityLevel:PriorityLevel,
  transaction:Uint8Array,
  rpcUrl:string) {
    const isDevnet = IsDevnet();
    if (isDevnet) {
      return 10000
    }
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            transaction: bs58.encode(transaction), // Pass the serialized transaction in Base58
            options: { priorityLevel: priorityLevel },
          },
        ],
      }),
    });
    const data = await response.json();
    
    data.result.priorityFeeEstimate = Math.round(data.result.priorityFeeEstimate)
    return data.result;
  }