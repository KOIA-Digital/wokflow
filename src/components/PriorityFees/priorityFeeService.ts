import { createContext, useContext } from "react";

export type PriorityLevel = "Min"| "Low" | "Medium" | "High" | "VeryHigh" | "UnsafeMax" | "Default"

const PriorityFeeContext = createContext<{priority: PriorityLevel, setPriority: (priority:PriorityLevel) => void}>({priority: "High", setPriority: (priority:PriorityLevel) => {}})

export const usePriorityFee = () => useContext(PriorityFeeContext)

export default PriorityFeeContext