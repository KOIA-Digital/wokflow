"use client"

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { MdHome } from "react-icons/md";
import { PiCoinFill } from "react-icons/pi";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdArrowDropup } from "react-icons/io";
import { FaPlus, FaStamp } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import { IoMdFlame } from "react-icons/io";
import { usePathname } from "next/navigation";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import { FaTools } from "react-icons/fa";
import { IoAirplane } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { RiTokenSwapLine } from "react-icons/ri";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Sidebar() {
    const [hidden, setHidden] = useState(true);
    const { width } = useWindowDimensions();
    const wallet = useWallet();

    const containerClass = width > 1024 ? "relative flex flex-col min-w-[250px] h-svh max-h-svh overflow-y-auto bg-black items-center" :
        hidden ? "fixed flex translate-x-[-250px] flex-col min-w-[250px] h-svh max-h-svh overflow-y-auto bg-black items-center" :
            "fixed flex flex-col min-w-[250px] h-svh max-h-svh overflow-y-auto bg-black items-center"

    return (<>
        {width <= 1024 && <div style={{ zIndex: 20000000 }} onClick={() => setHidden(!hidden)} className={`transition-all duration-300 fixed top-[10px] left-[10px] bg-black p-2 rounded cursor-pointer ${!hidden ? "translate-x-[250px]": ""}`}>{hidden ? <RxHamburgerMenu size={20}/> : <IoMdClose size={20}/>}</div>}
        {width <= 1024 && !hidden && <div style={{zIndex: 900}} onClick={() => setHidden(true)} className="fixed bg-[#000000c1] h-screen w-screen"></div>}
        <div style={{ zIndex: 1000 }} className={"transition-all duration-300 " + containerClass}>
            <Image src={"/logo.svg"} className="p-5" alt="dobi" width={250} height={50}></Image>
            <NavItem onClick={() => setHidden(true)} href="/" title="Home" icon={<MdHome size={20} />} />
            <NavGroup icon={<PiCoinFill size={20} />} title="Token">
                <NavItem onClick={() => setHidden(true)} href="/token" title="Create" icon={<FaPlus size={20} />} />
                <NavItem onClick={() => setHidden(true)} href="/token/update" title="Update" icon={<RxUpdate size={20} />} />
                <NavItem onClick={() => setHidden(true)} href="/token/mint" title="Mint" icon={<FaStamp size={20} />} />
                <NavItem onClick={() => setHidden(true)} href="/token/revoke-mint" title="Revoke mint" icon={<MdCancel size={20} />} />
                <NavItem onClick={() => setHidden(true)} href="/token/revoke-freeze" title="Revoke freeze" icon={<MdCancel size={20} />} />
                <NavItem onClick={() => setHidden(true)} href="/token/revoke-update" title="Revoke update" icon={<MdCancel size={20} />} />
                <NavItem onClick={() => setHidden(true)} href="/token/burn" title="Burn" icon={<IoMdFlame size={20} />} />
                <NavItem href="/token/airdrop" soon={true} title="Liquidity pool" icon={<RiTokenSwapLine size={20} />} />
                <NavItem soon={true} href="/token/airdrop" title="Airdrop" icon={<IoAirplane size={20} />} />
            </NavGroup>
            <NavItem href="/token/burn" title="Other tools" soon={true} icon={<FaTools size={20} />} />
        </div>
    </>

    );
}

export type NavItemProps = {
    href?: string
    title: string
    icon: ReactNode
    soon?: boolean
    onClick?: () => void
}

export function NavItem({ href, icon, title, soon, onClick }: NavItemProps) {
    const router = usePathname();

    return !soon && href ? <Link onClick={onClick} className={"w-full transition-all flex items-center gap-2 p-4 hover:bg-red-500 " + (router == href ? "bg-red-500" : "")} href={href} >{icon} {title}</Link> :
        <div className="w-full flex items-center justify-between">
            <div className="text-gray-400 transition-all flex items-center gap-2 p-4 text-gray-300">{icon} {title}</div>
            <div className="rounded text-sm p-1 px-2 m-4 bg-red-700">WIP</div>
        </div>
}

export type NavGroupProps = {
    children: ReactNode,
    title: string,
    icon: ReactNode
}

export function NavGroup({ children, title, icon }: NavGroupProps) {
    const [isOpen, setIsOpen] = useState(true)
    return <div className="w-full flex flex-col">
        <div onClick={() => setIsOpen(!isOpen)} className="transition-all flex items-center gap-2 p-4 bg-black hover:bg-red-500 cursor-pointer">
            {icon}
            <div className="text-center">{title}</div>
            {isOpen && <IoMdArrowDropup size={20} />}
            {!isOpen && <IoMdArrowDropdown size={20} />}
        </div>
        <div className="bg-red-900">
            {isOpen && children}
        </div>
    </div>
}