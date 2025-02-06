import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export function GetTokenAccount(mint:string, owner:string){
    return getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(owner)).toString()
}