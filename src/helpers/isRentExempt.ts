import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { fetchAllTokenByOwner, Token } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { DasApiAsset, dasApi } from '@metaplex-foundation/digital-asset-standard-api';

export const IsFeeExempt = async (wallet: WalletContextState) => {
    if (!wallet.publicKey) {
        return undefined
    } else {
        const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
        umi.use(walletAdapterIdentity(wallet));
        umi.use(dasApi())
        const tokens = await fetchAllTokenByOwner(umi, umi.identity.publicKey)
        console.log(tokens)
        const indexToken = tokens.findIndex(x => x.mint == publicKey("gndr9fJz14oUmPSgSUvkGjNGBzB9Jnsht1WbYqNSHNw"))
        
        let hasToken = false
        let token:Token | undefined; 
        if (indexToken != -1) {
            token = tokens[indexToken]
            if ((Number(token.amount)) > 1000000){
                hasToken = true
            }
        }
        const rpcAssetList = await umi.rpc.getAssetsByOwner({ owner: publicKey(wallet.publicKey!.toString()) })
        const spermz = rpcAssetList.items.filter(a => a.grouping.length > 0 && a.grouping.find(x => x.group_key == "collection")?.group_value == "5hRjpQ4wERgypn6xR8aZsN1qLEG7WbwC9D5GjAhvPdQL")
        const hasSpermz = spermz.length > 1
        
        return {hasToken, token, hasSpermz, spermz}
    }
}