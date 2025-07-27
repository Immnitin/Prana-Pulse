// src/components/MessageBox.jsx
import React from 'react';

export const MessageBox = ({ message, type }) => {
    if (!message) return null;
    const typeClasses = {
        error: "bg-red-100 text-red-800",
        success: "bg-green-100 text-green-800",
    };
    return (
        <div className={`p-4 rounded-md my-4 text-sm shadow-md ${typeClasses[type]}`}>
            {message}
        </div>
    );
};
