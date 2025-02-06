import { ChangeEvent, ChangeEventHandler } from "react"
import { useToast } from "./Toast/toastService"
import ErrorToast from "./Toast/errorToast"

export type FormInputNumberProps = {
    name: string,
    mandatory?: boolean,
    value: number,
    onChange: ChangeEventHandler<HTMLInputElement>,
    min?: number
    max?: number
}

export default function FormInputNumber({name, mandatory, value, onChange, min, max}: FormInputNumberProps) {
    const toast = useToast()

    const handleChange = (x:ChangeEvent<HTMLInputElement>) => {
        if (max) {
            if (x.target.valueAsNumber > max){
                toast.open(<ErrorToast message={`Max ${max}`} title="Error"/>)
                return
            }
        }
        if (min) {
            if (x.target.valueAsNumber < min){
                toast.open(<ErrorToast message={`Min ${min}`} title="Error"/>)
                return
            }
        }
        onChange(x)
    }
    
    return <div className="w-full flex flex-col gap-2">
        <div className="font-bold">{mandatory && <span className="text-red-300">*</span>}{name}:</div>
        <input value={value} type="number" onChange={handleChange} className="w-full bg-red-900 text-white outline-none px-4 py-2 rounded"></input>
    </div>
}