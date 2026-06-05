/**
 * Button is a form element that triggers an action on click.
 * @module Button
 */
import * as React from 'react';

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    /**
     * Text of the button.
     */
    label?: string;
    /**
     * Name of the icon.
     */
    icon?: string;
    /**
     * When present, it specifies that the component should be disabled.
     */
    disabled?: boolean;
    /**
     * Defines the severity of the button.
     */
    severity?: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'contrast';
    /**
     * Index of the element in tabbing order.
     */
    tabIndex?: number;
    /**
     * Children content (should be skipped by parser).
     */
    children?: React.ReactNode;
}

export declare class Button extends React.Component<ButtonProps, any> {}
