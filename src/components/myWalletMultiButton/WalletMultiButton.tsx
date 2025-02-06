"use client"

import React, { useEffect, useState } from 'react';
import { BaseWalletMultiButton } from './BaseWalletMultiButton';
import type { ButtonProps } from './Button.js';

const LABELS = {
    'change-wallet': 'Change wallet',
    connecting: 'Connecting ...',
    'copy-address': 'Copy address',
    copied: 'Copied',
    disconnect: 'Disconnect',
    'has-wallet': 'Connect',
    'no-wallet': 'Select Wallet',
} as const;

export function WalletMultiButton(props: ButtonProps) {
    const [clientSide, setClientSide] = useState(false);

    useEffect(() => {
        setClientSide(true); 
    }, []);
    return clientSide && <BaseWalletMultiButton {...props} labels={LABELS} />;
}
