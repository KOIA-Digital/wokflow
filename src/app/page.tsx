import ProductFruitsTourStarter from "@/components/ProductFruitsTourStarter";
import PageContainer from "@/components/pageContainer";
import Link from "next/link";
import { FaPlus, FaStamp } from "react-icons/fa6";
import { IoMdFlame } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";

export default function Home() {
  return (
    <PageContainer title="Welcome to WokFlow">
      <div className="py-5 pb-10 flex flex-wrap justify-center gap-5 w-[600px] max-w-[95%]">
        <ProductFruitsTourStarter tourId={62612} />
      </div>
      <div className="flex  pb-10 flex-col gap-10 w-[600px] max-w-[90%]">
        <div className="flex flex-col gap-2">
          <div className="text-xl md:text-2xl font-bold">Your Ultimate No-Code tool for Cooking on Solana!</div>
          <div className="text-justify text-gray-300">At WokFlow, we empower Solana Chefs (developers) with a seamless, no-code platform to unleash their creativity and efficiency in the Solana ecosystem. Whether you&apos;re looking to innovate or streamline your asset management on the blockchain, WokFlow is your go-to solution.</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xl md:text-2xl font-bold">What Can You Do on WokFlow?</div>
          <div className="text-justify text-gray-300">WokFlow offers a robust suite of features that simplifies the creation, management, and distribution of assets on the Solana network. Our platform is designed to cater to both seasoned developers and newcomers in the solana community. Here&apos;s a snapshot of what you can achieve with WokFlow:</div>
        </div>
      </div>
      <div className="pb-10 flex flex-wrap justify-center gap-5 w-[1000px] max-w-[95%]">
        <div className="flex flex-col gap-2 rounded-xl justify-between items-center gradient-bg p-6 w-[350px] flex-grow max-w-[90%]">
          <div className="text-2xl font-bold text-center">
            Create & Update Tokens
          </div>
          <div className="text-center">
            Easily launch new tokens and make updates without diving into complex code.
          </div>
          <div className="flex gap-2">
            <Link className="flex items-center gap-2 font-bold bg-red-500 hover:bg-red-700 px-4 py-2 rounded" href="/token"><FaPlus size={20} />Create</Link>
            <Link className="flex items-center gap-2 font-bold bg-black hover:bg-gray-900 px-4 py-2 rounded" href="/token/update"><RxUpdate size={20} />Update</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl justify-between items-center gradient-bg p-6 w-[350px] flex-grow max-w-[90%]">
          <div className="text-2xl font-bold text-center">
            Mint & Burn Tokens
          </div>
          <div className="text-center">
            Adjust your token supply with straightforward minting and burning capabilities.
          </div>
          <div className="flex gap-2">
            <Link className="flex items-center gap-2 font-bold bg-red-500 hover:bg-red-700 px-4 py-2 rounded" href="/token/mint"><FaStamp size={20} />Mint</Link>
            <Link className="flex items-center gap-2 font-bold bg-black hover:bg-gray-900 px-4 py-2 rounded" href="/token/burn"><IoMdFlame size={20} />Burn</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl justify-between items-center gradient-bg p-6 w-[350px] flex-grow max-w-[90%]">
          <div className="text-2xl font-bold text-center">
            Manage Authorities
          </div>
          <div className="text-center">
            Secure your tokens by revoking mint and freeze authorities.
          </div>
          <div className="flex gap-2">
            <Link className="flex items-center gap-2 font-bold bg-red-500 hover:bg-red-700 px-4 py-2 rounded" href="/token/revoke-mint"><MdCancel size={20} />Mint</Link>
            <Link className="flex items-center gap-2 font-bold bg-black hover:bg-gray-900 px-4 py-2 rounded" href="/token/revoke-freeze"><MdCancel size={20} />Freeze</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl justify-between items-center gradient-bg p-6 w-[350px] flex-grow max-w-[90%]">
          <div className="text-2xl font-bold text-center">
            Immutable Tokens
          </div>
          <div className="text-center">
            Ensure the longevity and stability of your tokens by making them immutable.
          </div>
          <div className="flex gap-2">
            <Link className="flex items-center gap-2 font-bold bg-red-500 hover:bg-red-700 px-4 py-2 rounded" href="/token/revoke-update"><MdCancel size={20} />Make Immutable</Link>
          </div>
        </div>
      </div>
      <div className="flex py-5 pb-10 flex-col gap-10 w-[600px] max-w-[90%]">
        <div className="flex flex-col gap-2">
          <div className="text-xl md:text-2xl font-bold">Looking Ahead: NFTs and Beyond</div>
          <div className="text-justify text-gray-300">The future at WokFlow is bright with the upcoming integration of Token 2022, NFTs, Core NFTs, and compressed NFTs (cNFTs). These features will offer similar functionalities, empowering you to pioneer in the NFT space with ease and innovation.</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xl md:text-2xl font-bold">Join Us on the Journey</div>
          <div className="text-justify text-gray-300">WokFlow is committed to evolving and expanding our platform to meet the needs of the Solana community. Stay tuned for more updates, and let&apos;s embark on this exciting journey together!</div>
        </div>
      </div>
    </PageContainer>
  );
}
