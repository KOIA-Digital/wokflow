import { ChangeEvent, ChangeEventHandler } from "react"
import { useToast } from "./Toast/toastService"
import ErrorToast from "./Toast/errorToast"

export type FormInputTextProps = {
    name: string,
    mandatory?: boolean,
    value: string,
    onChange: ChangeEventHandler<HTMLTextAreaElement>,
    maxChars?: number
}

export default function FormInputText({name, mandatory, value, onChange, maxChars}: FormInputTextProps) {
    const toast = useToast()

    const handleChange = (x:ChangeEvent<HTMLTextAreaElement>) => {
        if (maxChars) {
            if (x.target.value.length > maxChars) {
                toast.open(<ErrorToast title="Error" message={`Max ${maxChars} characters!`}/>)
                return;
            }
        }
        onChange(x)
    }
    
    return <div className="w-full flex flex-col gap-2">
        <div className="font-bold">{mandatory && <span className="text-red-300">*</span>}{name}:</div>
        <textarea rows={4} value={value} onChange={handleChange} className="resize-none w-full bg-red-900 text-white outline-none px-4 py-2 rounded"></textarea>
    </div>
}