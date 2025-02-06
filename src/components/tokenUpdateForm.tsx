"use client"
import { useEffect, useState } from "react";
import FormInput from "./formInput";
import FormInputText from "./formInputText";
import Button from "./button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import FileUpload from "./fileUpload";
import { NFTStorage, Blob } from 'nft.storage'
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey, none, publicKey, sol, some } from "@metaplex-foundation/umi";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { TokenStandard, updateMetadataAccountV2, fetchMetadataFromSeeds, UpdateMetadataAccountV2InstructionData, UpdateMetadataAccountV2InstructionAccounts, findMetadataPda, CreateMetadataAccountV3InstructionData, DataV2, CreateMetadataAccountV3InstructionAccounts, createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import { transferSol, setAuthority, AuthorityType } from "@metaplex-foundation/mpl-toolbox";
import Image from "next/image";
import TokenChooser, { BuiltToken } from "./tokenChooser";
import ErrorToast from "./Toast/errorToast";
import { useToast } from "./Toast/toastService";
import { usePriorityFee } from "./PriorityFees/priorityFeeService";
import { SendAndConfirm } from "@/helpers/sendAndConfirm";
import Switch from 'react-switch'
import { uploadFile } from "@/helpers/uploadFile";

interface Extensions {
    twitter?: string;
    website?: string;
    telegram?: string;
    discord?: string;
}

interface TokenData {
    name: string;
    symbol: string;
    description: string;
    image: string;
    extensions?: Extensions;
}


export default function TokenUpdateForm() {
    const [name, setName] = useState("")
    const [symbol, setSymbol] = useState("")
    const [description, setDescription] = useState("")
    const [twitter, setTwitter] = useState("")
    const [website, setWebsite] = useState("")
    const [discord, setDiscord] = useState("")
    const [telegram, setTelegram] = useState("")
    const [file, setFile] = useState<File>()
    const [isLoading, setIsLoading] = useState(false)
    const [buttonText, setButtonText] = useState("Update token")
    const [preview, setPreview] = useState<string>()
    const [showModal, setShowModal] = useState(false)
    const [selectedToken, setSelectedToken] = useState<BuiltToken>()
    const [imageUri, setImageUri] = useState<string>("")
    const [jsonMetadata, setJsonMetadata] = useState<TokenData>()
    const [immutable, setImmutable] = useState(false)
    const [revokeMint, setRevokeMint] = useState(false)
    const [revokeFreeze, setRevokeFreeze] = useState(false)
    const additionalFee = 0 + (immutable ? 0.001 : 0) + (revokeMint ? 0.001 : 0) + (revokeFreeze ? 0.001 : 0)

    useEffect(() => {
        if (!file) {
            setPreview(undefined)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [file])


    const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEQ4YUFCOWViMDgzZDRiYjk5QzE5NmFDZTUzOEY3NTZDZDYyMTU0ZjIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMTgwMjA4OTMzNSwibmFtZSI6Indva2Zsb3cifQ.KZz29Q8dCcK3aHtrFGafWcVxlUrP5Cv2thiJAOPAXyY'
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

    const onData = (file: File | undefined) => {
        setFile(file)
    }
    const wallet = useWallet()

    const isImmutable = (selectedToken && selectedToken.metadata && !selectedToken.metadata.isMutable) || (selectedToken && !selectedToken.metadata && selectedToken.mint.mintAuthority.__option == "None")
    const isUpdateAuthority = (wallet.publicKey && selectedToken && selectedToken.metadata && selectedToken.metadata.updateAuthority == publicKey(wallet.publicKey.toString()))
    const enabled = selectedToken && !isImmutable && selectedToken.metadata && ( 
        file != undefined ||
        name != selectedToken.metadata.name ||
        symbol != selectedToken.metadata.symbol ||
        description != (jsonMetadata?.description ??  "")||
        twitter != (jsonMetadata?.extensions?.twitter ?? "") ||
        discord != (jsonMetadata?.extensions?.discord ?? "") ||
        telegram != (jsonMetadata?.extensions?.telegram ?? "") ||
        website != (jsonMetadata?.extensions?.website ?? "" ))


    const toast = useToast()

    const {connection} = useConnection()
    const {priority} = usePriorityFee()
    const startMint = async () => {
        try {
            setIsLoading(true)
            if (wallet.publicKey && selectedToken) {
                if (await connection.getBalance(wallet.publicKey) < (Math.round((0.001 + additionalFee)*10000)/10000) * 10**9){
                    setIsLoading(false)
                    toast.open(
                        <ErrorToast title="Error" message={`You need at least ${Math.round((0.001 + additionalFee)*10000)/10000} SOL on your wallet`} />
                    )
                    return
                }
                let newImageUri = imageUri
                if (file){
                    setButtonText("Uploading image")
                    const { cid, uri } = await uploadFile(file);
                    newImageUri = uri
                }

                const jsonData: TokenData = {
                    name: name,
                    symbol: symbol,
                    description: description,
                    image: newImageUri,
                };
                setButtonText("Uploading metadata")

                let extensions: Extensions = {};

                if (twitter) extensions.twitter = twitter;
                if (website) extensions.website = website;
                if (telegram) extensions.telegram = telegram;
                if (discord) extensions.discord = discord;

                if (Object.keys(extensions).length !== 0) {
                    jsonData.extensions = extensions;
                }
                const metadataBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                const metadataFile = new File([metadataBlob], "metadata.json", { type: 'application/json', lastModified: Date.now() });
                const { cid, uri } = await uploadFile(metadataFile);
                const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URI ?? "")
                const metadata = {
                    name: name,
                    symbol: symbol,
                    uri: uri
                }

                umi.use(walletAdapterIdentity(wallet));
                umi.use(mplCandyMachine())
                setButtonText("Updating token")

                if (selectedToken.metadata){
                    const initialMetadata = await fetchMetadataFromSeeds(umi, {
                        mint: selectedToken.mint.publicKey,
                    });
                    const data: UpdateMetadataAccountV2InstructionData = {
                        data: some({ ...initialMetadata,
                            name: metadata.name,
                            symbol: metadata.symbol,
                            uri: metadata.uri
                        }),
                        discriminator: 0,
                        isMutable: some(true),
                        newUpdateAuthority: some<PublicKey>(umi.identity.publicKey),
                        primarySaleHappened: none<boolean>()
                    }
                    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
                        metadata: findMetadataPda(umi, { mint: selectedToken.mint.publicKey }),
                        updateAuthority: umi.identity
                    }
                    let tb = updateMetadataAccountV2(umi, { ...accounts, ...data })
                    
                    if (revokeMint) {
                        tb = tb.add(setAuthority(umi, {
                            owned: selectedToken.mint.publicKey,
                            owner: umi.identity,
                            authorityType: AuthorityType.MintTokens,
                            newAuthority: none(),
                        }))
                    }

                    if (revokeFreeze) {
                        tb = tb.add(setAuthority(umi, {
                            owned: selectedToken.mint.publicKey,
                            owner: umi.identity,
                            authorityType: AuthorityType.MintTokens,
                            newAuthority: none(),
                        }))
                    }

                    tb = tb.prepend(
                        transferSol(umi, {
                            destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                            amount: sol(Number(Math.round((0.001 + additionalFee) * 100) / 100)),
                        }))


                    const res = await SendAndConfirm(tb, umi, priority, connection)
                } else {
                    const met:DataV2 = {
                        name: metadata.name,
                        symbol: metadata.symbol,
                        uri: metadata.uri,
                        sellerFeeBasisPoints: 0,
                        creators: none(),
                        collection: none(),
                        uses: none()
                    }
                    const data: CreateMetadataAccountV3InstructionData = {
                        data: met,
                        discriminator: 0,
                        isMutable: !immutable,
                        collectionDetails: none(),
                    }
                    const accounts: CreateMetadataAccountV3InstructionAccounts = {
                        mint: selectedToken.mint.publicKey,
                        mintAuthority: umi.identity
                    }
                    let tb = createMetadataAccountV3(umi, {...accounts, ...data})

                    if (revokeMint) {
                        tb = tb.add(setAuthority(umi, {
                            owned: selectedToken.mint.publicKey,
                            owner: umi.identity,
                            authorityType: AuthorityType.MintTokens,
                            newAuthority: none(),
                        }))
                    }

                    if (revokeFreeze) {
                        tb = tb.add(setAuthority(umi, {
                            owned: selectedToken.mint.publicKey,
                            owner: umi.identity,
                            authorityType: AuthorityType.MintTokens,
                            newAuthority: none(),
                        }))
                    }
                    tb = tb.prepend(
                        transferSol(umi, {
                            destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                            amount: sol(Number(Math.round((0.001 + additionalFee) * 10000) / 10000)),
                        }))


                    const res = await SendAndConfirm(tb, umi, priority, connection)
                }
            }
            setShowModal(true)
            setButtonText("Update token")
            setIsLoading(false)
        } catch (error:any) {
            toast.open(<ErrorToast title="Error" message={error.toString()}/>)
            setButtonText("Update token")
            setIsLoading(false)
        }
    }

    const onChoose = (token: BuiltToken) => {
        setSelectedToken(token)
        if (!token.metadata || token.metadata.isMutable){
            setToken(token)
        }
    }

    const setToken = async (token: BuiltToken) => {
        setName(token.metadata?.name ?? "")
        setSymbol(token.metadata?.symbol ?? "")
        let res:Response | undefined
        if (token.metadata) {
            res = await fetch(token.metadata.uri, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            })
        }
        
        const jsonMetadata = res ? await res.json() : undefined
        if (jsonMetadata){
            setJsonMetadata(jsonMetadata as TokenData)
            if (jsonMetadata.description){
                setDescription(jsonMetadata.description)
            }
            if (jsonMetadata.image){
                setImageUri(jsonMetadata.image)
            }
            if (jsonMetadata.extensions){
                if (jsonMetadata.extensions.twitter){
                    setTwitter(jsonMetadata.extensions.twitter)
                }
                if (jsonMetadata.extensions.discord){
                    setDiscord(jsonMetadata.extensions.discord)
                }
                if (jsonMetadata.extensions.website){
                    setWebsite(jsonMetadata.extensions.website)
                }
                if (jsonMetadata.extensions.telegram){
                    setTelegram(jsonMetadata.extensions.telegram)
                }
            }
        }
    }

    return <div className="w-[600px] flex flex-col gap-4 max-w-[90%]">
        {showModal && <div style={{ zIndex: 500 }} className="flex justify-center items-center fixed bg-[#000000c1] h-screen w-screen top-0 left-0">
            <div className="flex flex-col bg-red-900 p-8 justify-center items-center gap-2 rounded">
                <div className="text-2xl font-bold">Token successfully updated</div>
                {preview && <Image src={preview} alt="image" width={100} height={100} />}
                <div>{name} <span className="font-bold">{symbol}</span></div>
                <div className="flex gap-2">
                    <a className="flex items-center gap-2 bg-red-500 py-3 px-5 rounded hover:bg-red-600 w-max font-bold" href={`https://solscan.io/address/${selectedToken?.mint.publicKey.toString()}`} target="_blank" rel="noopener noreferrer">Solscan</a>
                    <Button title="Close" onClick={() => setShowModal(false)} />
                </div>
            </div>
        </div>}
        <TokenChooser allowedStandards={[TokenStandard.Fungible]} onChoose={onChoose} />
        {isImmutable && <div className="self-center text-yellow-500">This token is immutable</div>}
        {selectedToken && !isImmutable && !isUpdateAuthority && <div className="self-center text-yellow-500">Connected wallet is not update authority of this token</div>}

        {selectedToken && !isImmutable && isUpdateAuthority && <>
            <div className="flex flex-col gap-4 min-[450px]:flex-row">  
                <div className="flex justify-center w-full min-[450px]:block min-[450px]:w-max">            
                    <div className="w-max">
                        <FileUpload onData={onData} />
                    </div>
                </div>         
                <div className="flex flex-col gap-4 w-full">
                    <FormInput value={name} onChange={(x) => {setName(x.target.value)}} maxChars={30} name="Name" mandatory={true} />
                    <FormInput value={symbol} onChange={(x) => {setSymbol(x.target.value)}} maxChars={8} name="Symbol" mandatory={true} />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <FormInputText value={description} maxChars={500} onChange={(x) => { setDescription(x.target.value) }} name="Description" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <FormInput value={twitter} onChange={(x) => { setTwitter(x.target.value) }} name="Twitter" />
                <FormInput value={telegram} onChange={(x) => { setTelegram(x.target.value) }} name="Telegram" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <FormInput value={website} onChange={(x) => { setWebsite(x.target.value) }} name="Website" />
                <FormInput value={discord} onChange={(x) => { setDiscord(x.target.value) }} name="Discord" />
            </div>
            <div className="flex flex-col justify-center sm:flex-row gap-2 sm:justify-between">
        <label className="flex gap-2 justify-between sm:justify-center" htmlFor="make-immutable">
          <span>Immutable</span>
          <Switch
            checked={immutable}
            onChange={(x) => setImmutable(x)}
            onColor="#7f1d1d"
            onHandleColor="#EF4444"
            handleDiameter={30}
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={48}
            className="react-switch"
            id="make-immutable"
          />
        </label>
        { (wallet.publicKey && selectedToken.mint.mintAuthority.__option != "None") ?
        <label className="flex gap-2 justify-between sm:justify-center" htmlFor="revoke-mint">
          <span>Revoke Mint</span>
          <Switch
            checked={revokeMint}
            onChange={(x) => setRevokeMint(x)}
            onColor="#7f1d1d"
            onHandleColor="#EF4444"
            handleDiameter={30}
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={48}
            className="react-switch"
            id="revoke-mint"
          />
        </label> : <div className="text-lime-200">mint revoked</div>}
        {(wallet.publicKey && selectedToken.mint.freezeAuthority.__option != "None") ? <label className="flex gap-2 justify-between sm:justify-center" htmlFor="revoke-freeze">
          <span>Revoke Freeze</span>
          <Switch
            checked={revokeFreeze}
            onChange={(x) => setRevokeFreeze(x)}
            onColor="#7f1d1d"
            onHandleColor="#EF4444"
            handleDiameter={30}
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={48}
            className="react-switch"
            id="revoke-freeze"
          />
        </label> : <div className="text-lime-200">freeze revoked</div>}
        </div>
        </>}
        <div className="self-center">{wallet.publicKey ? <Button isLoading={isLoading} onClick={startMint} disabled={!enabled || isLoading} title={buttonText} /> : <WalletMultiButton />}</div>
        <div className="text-sm text-center text-gray-400">platform fee: <span className="font-bold">{Math.round((0.001 + additionalFee)*10000)/10000} SOL</span></div>
    </div>
}