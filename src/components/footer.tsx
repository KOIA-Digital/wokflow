"use client"

import { FaGithub, FaTelegram, FaTwitter } from "react-icons/fa6";

export default function Footer() {
    return <div className="flex flex-col gap-2 p-10 mt-auto items-center">
    <div className="flex gap-2">
        <a href="https://twitter.com/wok_flow" target="_blank" rel="noopener noreferrer"><FaTwitter size={30}/></a>
        <a href="https://t.me/wokflow" target="_blank" rel="noopener noreferrer"><FaTelegram size={30}/></a>
        <a href="https://github.com/KOIA-Digital/wokflow" target="_blank" rel="noopener noreferrer"><FaGithub size={30}/></a>
    </div>
    <div>All rights reserved to KOIA s.r.o.</div>
</div>
}