"use client"
import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi";
import Image from "next/image"
import { MdCancel } from "react-icons/md";

export type FileUploadProps = {
    onData: (file: File | undefined) => void
}

export default function FileUpload({ onData }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File>()
    const [preview, setPreview] = useState<string>()

    useEffect(() => {
        if (!file) {
            setPreview(undefined)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    return <>
        <input className="hidden" onChange={(x) => {
            if (x.target.files && x.target.files[0]) {
                setFile(x.target.files[0])
                onData(x.target.files[0])
            }
        }} ref={inputRef} multiple={false} accept="image/png, image/jpeg" type="file"></input>
        <div className=" relative w-full flex flex-col gap-2">
            <div className="font-bold">Image:</div>
            <div className="flex relative cursor-pointer h-[128px] w-[128px] rounded bg-red-900 justify-center items-center overflow-hidden" onClick={() => inputRef.current?.click()}>
                <div className="absolute bg-black/60 p-2 rounded-[1000px]"><FiUpload size={30} /></div>
                {preview && <Image className="rounded" alt="image" width={128} height={128} src={preview} />}
            </div>
            {preview && <div onClick={() => {
                if (inputRef.current) {
                    inputRef.current.value = ""
                    setPreview(undefined)
                    setFile(undefined)
                    onData(undefined)
                }
            }} className="absolute bg-black rounded-[1000px] top-0 right-0"><MdCancel size={30} /></div>}

        </div>
    </>
}