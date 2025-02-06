export function IsDevnet() {
    return process.env.NEXT_PUBLIC_NETWORK ? process.env.NEXT_PUBLIC_NETWORK === "devnet" : false
}