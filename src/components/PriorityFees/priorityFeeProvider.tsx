"use client"

import { ReactNode, useState } from "react";
import PriorityFeeContext, { PriorityLevel } from "./priorityFeeService";

export default function PriorityFeeProvider({children}: {children:ReactNode}){
    const [priority, setPriorityLevel] = useState<PriorityLevel>("High")

    const setPriority = (priority:PriorityLevel) => {
        setPriorityLevel(priority)
    }

    return (
        <PriorityFeeContext.Provider value={{priority, setPriority}}>
            {children}
        </PriorityFeeContext.Provider>
    )
}