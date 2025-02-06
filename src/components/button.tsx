import { ReactNode } from "react"
import { ImSpinner2 } from "react-icons/im";

export type ButtonProps = {
    title?: string,
    icon?: ReactNode,
    onClick?: () => void,
    disabled?: boolean
    isLoading?: boolean,
    children?: ReactNode,
    variant?: "normal" | "white" | "sm-white"
}

export default function Button({children, icon, title, onClick, disabled, isLoading, variant}:ButtonProps) {
    let className:string
    if (variant == "white"){
        className = !disabled ? "flex text-black items-center gap-2 bg-white py-3 px-5 rounded hover:bg-gray-200 w-max font-bold" :
        "flex items-center text-black gap-2 bg-white opacity-50 py-3 px-5 rounded w-max font-bold"
    } else if (variant == "sm-white") {
        className = !disabled ? "flex text-black items-center gap-2 bg-white py-1 px-2 rounded hover:bg-gray-200 w-max font-bold" :
        "flex items-center text-black gap-2 bg-white opacity-50 py-1 px-2 rounded w-max font-bold"
    } else {
        className = !disabled ? "flex items-center gap-2 bg-red-500 py-3 px-5 rounded hover:bg-red-600 w-max font-bold" :
        "flex items-center gap-2 bg-red-500 opacity-50 py-3 px-5 rounded w-max font-bold"
    }

    return <button className={className} disabled={disabled} onClick={onClick}>
        {icon && !isLoading && icon}
        {isLoading && <ImSpinner2 className="animate-spin"/>}
        {title}
        {children && children}
    </button>
}