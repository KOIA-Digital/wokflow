"use client"
import { useEffect, useState } from "react";
import FormInput from "./formInput";
import FormInputNumber from "./formInputNumber";
import FormInputText from "./formInputText";
import Button from "./button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "./myWalletMultiButton/WalletMultiButton"
import FileUpload from "./fileUpload";
import { NFTStorage, Blob } from 'nft.storage'
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, none, percentAmount, publicKey, sol } from "@metaplex-foundation/umi";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { TokenStandard, createAndMint } from "@metaplex-foundation/mpl-token-metadata";
import { transferSol, setAuthority, AuthorityType } from "@metaplex-foundation/mpl-toolbox";
import Image from "next/image";
import { useToast } from "./Toast/toastService";
import ErrorToast from "./Toast/errorToast";
import { usePriorityFee } from "./PriorityFees/priorityFeeService";
import { SendAndConfirm } from "@/helpers/sendAndConfirm";
import { IsDevnet } from "@/helpers/isDevnet";
import Switch from "react-switch"
import { FileObject, PinataSDK } from "pinata-web3";
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


export default function TokenCreateForm() {
    const [name, setName] = useState("")
    const [symbol, setSymbol] = useState("")
    const [supply, setSupply] = useState(1)
    const [decimals, setDecimals] = useState(6)
    const [description, setDescription] = useState("")
    const [twitter, setTwitter] = useState("")
    const [website, setWebsite] = useState("")
    const [discord, setDiscord] = useState("")
    const [telegram, setTelegram] = useState("")
    const [file, setFile] = useState<File>()
    const [isLoading, setIsLoading] = useState(false)
    const [buttonText, setButtonText] = useState("Create token")
    const [preview, setPreview] = useState<string>()
    const [mint, setMint] = useState<string>()
    const [showModal, setShowModal] = useState(false)
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

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])


    const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFTSTORAGE_KEY ?? ""
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

    const onData = (file: File | undefined) => {
        setFile(file)
    }

    const disabled = name.trim() == "" || symbol.trim() == "" ||
        !supply || supply < 1 ||
        decimals > 9 || decimals < 0 ||
        description.trim() == "" || isLoading

    const wallet = useWallet()
    const { connection } = useConnection()
    const { priority } = usePriorityFee()
    const toast = useToast()

    const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
        pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATE
    });

    const startMint = async () => {
        try {
            setIsLoading(true)
            if (wallet.publicKey) {
                const balance = await connection.getBalance(wallet.publicKey)

                if (await connection.getBalance(wallet.publicKey) < (Math.round((0.01 + additionalFee) * 100) / 100) * 10 ** 9) {
                    setButtonText("Create token")
                    setIsLoading(false)
                    toast.open(
                        <ErrorToast title="Error" message={`You need at least ${Math.round((0.01 + additionalFee) * 100) / 100} SOL on your wallet`} />
                    )
                    return
                }

                let imageUri = IsDevnet() ? "" : ""
                if (file) {
                    setButtonText("Uploading image")
                    const { cid, uri } = await uploadFile(file);
                    imageUri = uri
                }

                const jsonData: TokenData = {
                    name: name,
                    symbol: symbol,
                    description: description,
                    image: imageUri
                };
                console.log(jsonData)

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
                console.log(metadata)

                const mint = generateSigner(umi);
                setMint(mint.publicKey)
                umi.use(walletAdapterIdentity(wallet));
                umi.use(mplCandyMachine())
                setButtonText("Minting token")
                let tb = createAndMint(umi, {
                    mint,
                    authority: umi.identity,
                    isMutable: !immutable,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    sellerFeeBasisPoints: percentAmount(0),
                    decimals: decimals,
                    amount: Math.round(supply * (10 ** decimals)),
                    tokenOwner: publicKey(wallet.publicKey.toString()),
                    tokenStandard: TokenStandard.Fungible,
                })

                if (revokeMint) {
                    tb = tb.add(setAuthority(umi, {
                        owned: mint.publicKey,
                        owner: umi.identity,
                        authorityType: AuthorityType.MintTokens,
                        newAuthority: none(),
                    }))
                }

                if (revokeFreeze) {
                    tb = tb.add(setAuthority(umi, {
                        owned: mint.publicKey,
                        owner: umi.identity,
                        authorityType: AuthorityType.FreezeAccount,
                        newAuthority: none(),
                    }))
                }

                tb = tb.prepend(
                    transferSol(umi, {
                        destination: publicKey(process.env.NEXT_PUBLIC_FEE_COLLECTION_WALLET ?? ""),
                        amount: sol(Number(Math.round((0.01 + additionalFee) * 10000) / 10000)),
                    }))

                const res = await SendAndConfirm(tb, umi, priority, connection);
                if (res) {
                    setShowModal(true)
                    setButtonText("Create token")
                    setIsLoading(false)
                }
            }
        } catch (error: any) {
            toast.open(<ErrorToast title="Error" message={error.toString()} />)
            setButtonText("Create token")
            setIsLoading(false)
        }
    }

    return <div className="w-[600px] flex flex-col gap-4 max-w-[90%]">
        {showModal && <div style={{ zIndex: 500 }} className="flex justify-center items-center fixed bg-[#000000c1] h-screen w-screen top-0 left-0">
            <div className="flex flex-col bg-red-900 p-8 justify-center items-center gap-2 rounded">
                <div className="text-2xl font-bold">Token successfully created</div>
                {preview && <Image src={preview} alt="image" width={100} height={100} />}
                <div>{name} <span className="font-bold">{symbol}</span></div>
                <div className="flex gap-2">
                    <a className="flex items-center gap-2 bg-red-500 py-3 px-5 rounded hover:bg-red-600 w-max font-bold" href={`https://solscan.io/address/${mint}?cluster=devnet`} target="_blank" rel="noopener noreferrer">Solscan</a>
                    <Button title="Close" onClick={() => setShowModal(false)} />
                </div>
            </div>
        </div>}
        <div className="flex flex-col gap-4 min-[450px]:flex-row">
            <div className="flex justify-center w-full min-[450px]:block min-[450px]:w-max">
                <div className="w-max">
                    <FileUpload onData={onData} />
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full">
                <FormInput value={name} onChange={(x) => { setName(x.target.value) }} maxChars={30} name="Name" mandatory={true} />
                <FormInput value={symbol} onChange={(x) => { setSymbol(x.target.value) }} maxChars={8} name="Symbol" mandatory={true} />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <FormInputText value={description} maxChars={500} onChange={(x) => { setDescription(x.target.value) }} name="Description" mandatory={true} />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <FormInputNumber value={supply} onChange={(x) => { setSupply(x.target.valueAsNumber) }} name="Supply" mandatory={true} />
            <FormInputNumber value={decimals} min={0} max={9} onChange={(x) => { setDecimals(x.target.valueAsNumber) }} name="Decimals" mandatory={true} />
        </div>
        <div className="socials flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <FormInput value={twitter} onChange={(x) => { setTwitter(x.target.value) }} name="Twitter" />
                <FormInput value={telegram} onChange={(x) => { setTelegram(x.target.value) }} name="Telegram" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <FormInput value={website} onChange={(x) => { setWebsite(x.target.value) }} name="Website" />
                <FormInput value={discord} onChange={(x) => { setDiscord(x.target.value) }} name="Discord" />
            </div>
        </div>
        <div className="flex flex-col justify-center sm:flex-row gap-2 sm:justify-between w-full">
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
            </label>
            <label className="flex gap-2 justify-between sm:justify-center" htmlFor="revoke-freeze">
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
            </label>
        </div>
        <div className="flex flex-col gap-2">
            <div className="self-center">
                {wallet.publicKey ? <Button isLoading={isLoading} onClick={startMint} disabled={disabled} title={buttonText} /> : <WalletMultiButton />}
            </div>
            <div className="text-sm text-center text-gray-400">platform fee: <span className="font-bold">{Math.round((0.01 + additionalFee) * 10000) / 10000} SOL</span></div>
        </div>
    </div>
}