import type { CSSProperties, FC, MouseEvent, PropsWithChildren, ReactElement } from 'react';
import React from 'react';

export type ButtonProps = PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    endIcon?: ReactElement;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    startIcon?: ReactElement;
    style?: CSSProperties;
    tabIndex?: number;
}>;

export const Button: FC<ButtonProps> = (props) => {
    return (
        <button
            className={`wallet-adapter-button ${props.className || ''}`}
            disabled={props.disabled}
            style={props.style}
            onClick={props.onClick}
            tabIndex={props.tabIndex || 0}
            type="button"
        >
            {props.startIcon && <div className="wallet-adapter-button-start-icon">{props.startIcon}</div>}
            {props.children}
            {props.endIcon && <div className="wallet-adapter-button-end-icon">{props.endIcon}</div>}
        </button>
    );
};
