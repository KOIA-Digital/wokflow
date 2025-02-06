import { ChangeEvent, ChangeEventHandler } from "react"
import { useToast } from "./Toast/toastService"
import ErrorToast from "./Toast/errorToast"

export type FormInputProps = {
    name: string,
    mandatory?: boolean,
    value: string,
    onChange: ChangeEventHandler<HTMLInputElement>,
    maxChars?: number
}

export default function FormInput({name, mandatory, value, onChange, maxChars}: FormInputProps) {
    const toast = useToast()

    const handleChange = (x:ChangeEvent<HTMLInputElement>) => {
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
        <input value={value} onChange={handleChange} className="w-full bg-red-900 text-white outline-none px-4 py-2 rounded"></input>
    </div>
}