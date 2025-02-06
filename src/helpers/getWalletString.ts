export function GetWalletString(wallet:string) {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
}