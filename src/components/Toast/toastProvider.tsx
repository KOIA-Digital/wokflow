"use client"

import { ReactNode, useState } from "react"
import ToastContext from "./toastService"
import { IoMdClose } from "react-icons/io";

export type ToastProviderProps = {
    children: ReactNode
}

export type Toast = {
    id:number,
    component: ReactNode
}

export default function ToastProvider({children}: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const open = (component:ReactNode, timeout = 5000) => {
        const id = Date.now()
        setToasts(toasts => [...toasts, {id, component}])

        setTimeout(() => close(id), timeout)
    }

    const close = (id:number) => setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
    return (
        <ToastContext.Provider value={{open, close}}>
            {children}
            <div className="space-y-2 absolute bottom-4 right-4">
                {toasts.map(({id, component}: Toast)=> (
                    <div className="relative" key={id}>
                        <div onClick={() => close(id)} className="absolute top-2 right-2 p-1 rounded-lg bg-gray-200/20 text-gray-800/60 cursor-pointer">
                            <IoMdClose size={16}/>
                        </div>
                        {component}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}