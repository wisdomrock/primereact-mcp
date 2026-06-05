/**
 * AltProps is a component whose Props interface uses a non-standard name.
 * @module AltProps
 */
import * as React from 'react';

export interface AltProps {
    /**
     * The label to display.
     */
    label?: string;
    /**
     * Fires when the component is clicked.
     */
    onClick?: (event: React.MouseEvent) => void;
}

export declare class AltPropsComponent extends React.Component<AltProps, any> {}
