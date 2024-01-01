import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const NewSpinner: React.FC<SpinnerProps> = ({ size }: any) => {
    return (
        <Spinner size={size} animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    );
}

export default NewSpinner;