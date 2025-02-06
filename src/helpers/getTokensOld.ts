import { BuiltToken } from "@/components/tokenChooser"
import { Umi } from "@metaplex-foundation/umi"
import { fetchAllMintByOwner, fetchAllTokenByOwner } from "@metaplex-foundation/mpl-toolbox";
import { fetchAllMetadataByOwner, TokenStandard } from "@metaplex-foundation/mpl-token-metadata"


export const GetTokens = async (umi: Umi) => {
    const mintsFromOwner = await fetchAllMintByOwner(umi, umi.identity.publicKey)
    const tokensFromOwner = await fetchAllTokenByOwner(umi, umi.identity.publicKey)
    const tokenMetadataByOwner = await fetchAllMetadataByOwner(umi, umi.identity.publicKey)

    if (mintsFromOwner && mintsFromOwner.length > 0) {
        let tokens: BuiltToken[] = []

        for (let index = 0; index < mintsFromOwner.length; index++) {
            const element = mintsFromOwner[index];
            let image: any
            const metadata = tokenMetadataByOwner.find(x => x.mint == element.publicKey)
            if (metadata && metadata.tokenStandard.__option == "Some" && metadata.tokenStandard.value != TokenStandard.Fungible) {
                continue
            }
            try {
                if (metadata) {
                    const res = await fetch(metadata.uri, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        }
                    })
                    image = await res.json()
                }
            } catch (error) {
            }

            const tokenAccount = tokensFromOwner.find(x => x.mint == element.publicKey)

            const token: BuiltToken = {
                mint: element,
                metadata: metadata,
                image: image?.image,
                token: tokenAccount ? tokenAccount : undefined
            }
            tokens.push(token)

        }
        return tokens

    } else return []
}