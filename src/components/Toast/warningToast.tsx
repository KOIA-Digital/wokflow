import { MdOutlineWarning } from "react-icons/md";

export default function WarningToast({title, message}: {title:string, message:string}) {
    return <div className="flex gap-2 bg-yellow-300 text-yellow-800 p-4 rounded-lg shadow-lg max-w-[300px]">
        <div className="min-w-[40px]">
        <MdOutlineWarning size={40} />
        </div>
        <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm">{message}</p>
        </div>
    </div>
}