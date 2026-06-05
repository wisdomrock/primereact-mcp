/**
 * Dialog component is a container to display content in an overlay window.
 * @module Dialog
 */
import * as React from 'react';

export interface DialogProps {
    /**
     * Title text of the dialog.
     */
    header?: string;
    /**
     * Specifies the visibility of the dialog.
     */
    visible?: boolean;
    /**
     * Style class of the component.
     */
    className?: string;
    /**
     * Style of the component.
     */
    style?: React.CSSProperties;
    /**
     * Children content (should be skipped by parser).
     */
    children?: React.ReactNode;
    /**
     * Callback to invoke when dialog is hidden.
     * @param {React.SyntheticEvent} event - Browser event.
     */
    onHide: () => void;
    /**
     * Callback to invoke when dialog is shown.
     */
    onShow?: () => void;
}

export declare class Dialog extends React.Component<DialogProps, any> {}
