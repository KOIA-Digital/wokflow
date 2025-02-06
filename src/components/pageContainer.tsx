import { ReactNode } from "react"
import Wallet from "./wallet"
import ToastProvider from "./Toast/toastProvider"
import Footer from "./footer"
import Sidebar from "./sidebar"

export type PageContainerProps = {
    children: ReactNode,
    title: string,
    description?: string
}

export default function PageContainer({ children, title, description }: PageContainerProps) {
    return <Wallet>
        <ToastProvider>
        <Sidebar />
            <main style={{ background: "#2C0F0F" }} className="flex overflow-auto w-full min-h-svh max-h-svh items-center flex-col pt-20">

                <div className="text-4xl p-4 font-bold px-[60px] lg:px-4 text-center">{title}</div>
                {description && <div className="pb-4 px-2 text-center">{description}</div>}
                {children}
                <Footer />
            </main>
        </ToastProvider>
    </Wallet>
}