import { ReactNode, createContext, useContext } from "react";

const ToastContext = createContext({open: (component:ReactNode, timeout = 5000) => {},close: (id:number) => {}})

export const useToast = () => useContext(ToastContext)

export default ToastContext