import { MdCelebration } from "react-icons/md";

export default function SuccessToast({title, message}: {title:string, message:string}) {
    return <div className="flex gap-2 bg-green-300 text-green-800 p-4 rounded-lg shadow-lg max-w-[300px]">
        <div className="min-w-[40px]">
        <MdCelebration size={40} />
        </div>
        <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm">{message}</p>
        </div>
    </div>
}