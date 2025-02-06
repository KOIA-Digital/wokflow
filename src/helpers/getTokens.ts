import { BuiltToken } from "@/components/tokenChooser"
import { Umi } from "@metaplex-foundation/umi"
import { fetchAllMintByOwner, fetchAllTokenByOwner } from "@metaplex-foundation/mpl-toolbox";
import { fetchAllMetadataByOwner, TokenStandard } from "@metaplex-foundation/mpl-token-metadata"

export const GetTokens = async (umi: Umi, allowedStandards?: TokenStandard[]) => {
    const delayIncrement = 100;
    let delay = 0;
    
    const p1 = new Promise(resolve => setTimeout(resolve, delay)).then(() => {console.log('xd'); return fetchAllMintByOwner(umi, umi.identity.publicKey)});
    delay += delayIncrement;
    const p2 = new Promise(resolve => setTimeout(resolve, delay)).then(() => {console.log('xd2'); return fetchAllTokenByOwner(umi, umi.identity.publicKey)});
    delay += delayIncrement;
    const p3 = new Promise(resolve => setTimeout(resolve, delay)).then(() => fetchAllMetadataByOwner(umi, umi.identity.publicKey));
    const [mintsFromOwner, tokensFromOwner, tokenMetadataByOwner] = await Promise.all([p1, p2, p3]);

    if (!mintsFromOwner || mintsFromOwner.length === 0) return [];

    let tokens: BuiltToken[] = [];
    const fetchPromises = mintsFromOwner.map(element => {
        const metadata = tokenMetadataByOwner.find(x => x.mint === element.publicKey);
        if (allowedStandards) {
            if (!metadata) {
                return null
            }
            if (metadata.tokenStandard.__option !== "Some"){
                return null
            }
            if (!allowedStandards.includes(metadata.tokenStandard.value)){
                return null
            }
        }
        const timeout = new Promise((resolve) => setTimeout(resolve, 2000, { timeout: true }));
        const fetchMetadata = metadata && fetch(metadata.uri, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        }).then(response => response.json().catch(e => ({ error: 'Failed to parse JSON', details: e })))
          .catch(e => ({ error: 'Failed to fetch metadata', details: e }));
        return Promise.race([fetchMetadata, timeout]).then(image => {
            if (!image || image.timeout) {
                console.error("Fetch timed out for:", metadata?.uri);
            } else if (image.error) {
                console.error(image.error, image.details);
            }

            const tokenAccount = tokensFromOwner.find(x => x.mint === element.publicKey);
            return {
                mint: element,
                metadata: metadata,
                image: image.image,
                token: tokenAccount ? tokenAccount : undefined
            };
        });
    });

    const results = await Promise.allSettled(fetchPromises);
    tokens = results.reduce((acc, result) => {
        if (result.status === 'fulfilled' && result.value !== null) {
            acc.push(result.value);
        }
        return acc;
    }, [] as BuiltToken[]);
    return tokens;
};