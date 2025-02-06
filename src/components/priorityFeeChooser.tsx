"use client"

import { useState } from "react";
import { PriorityLevel, usePriorityFee } from "./PriorityFees/priorityFeeService";
import { GrTransaction } from "react-icons/gr";
import useWindowDimensions from "@/hooks/useWindowDimensions";


export default function PriorityFeeChooser() {
    const priority = usePriorityFee()
    const [showModal, setShowModal] = useState(false)
    const window = useWindowDimensions()
    const setPriority = (p: PriorityLevel) => {
        priority.setPriority(p)
        setShowModal(false)
    }
    const className = window.width> 1024 ? "p-2 px-4" : "p-[8px] px-[16px] text-sm"
    return (<>
        {showModal && <div style={{ zIndex: 1000 }} className="flex justify-center items-center fixed bg-[#000000c1] h-screen w-screen top-0 left-0">

            <div className="flex flex-col bg-green-900 p-8 max-h-[90%] overflow-auto gap-2 rounded">
                <div className="text-2xl font-bold self-center">Choose priority</div>
                <div className="flex gap-2 p-4 bg-green-700 items-center rounded cursor-pointer" onClick={() => setPriority("Low")}>
                    <div className="font-bold">
                        Low
                    </div>
                </div>
                <div className="flex gap-2 p-4 bg-green-700 items-center rounded cursor-pointer" onClick={() => setPriority("Medium")}>
                    <div className="font-bold">
                        Medium
                    </div>
                </div>
                <div className="flex gap-2 p-4 bg-green-700 items-center rounded cursor-pointer" onClick={() => setPriority("High")}>
                    <div className="font-bold">
                        High
                    </div>
                </div>
                <div className="flex gap-2 p-4 bg-green-700 items-center rounded cursor-pointer" onClick={() => setPriority("VeryHigh")}>
                    <div className="font-bold">
                        Very High
                    </div>
                </div>
                <div className="flex gap-2 p-4 bg-green-700 items-center rounded cursor-pointer self-center" onClick={() => setShowModal(false)}>
                    <div className="font-bold">
                        Close
                    </div>
                </div>
            </div>
        </div>}
        <div className={"flex gap-2 bg-green-700 items-center rounded cursor-pointer " + className} onClick={() => setShowModal(true)}>
            <GrTransaction size={window.width > 1024 ? 20 : 10} />{window.width > 1024 ?  "Priority fee:" :""} <span className="font-bold">{priority.priority == "VeryHigh" ? "Very High": priority.priority}</span>
        </div>
    </>

    )
}