'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import './style.css'
import { CircleCheck } from 'lucide-react';
type AlertType = 'success' | 'error' | 'warn';

type Alert = {
    message: string;
    type: AlertType;
};

type AlertContextType = {
    alert: {
        success: (msg: string) => void;
        error: (msg: string) => void;
        warn: (msg: string) => void;
    };
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) throw new Error('usealert must be used within alertProvider');
    return context.alert;
}

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alert, setAlert] = useState<Alert | null>(null);

    const show = (type: AlertType, message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 2000); // auto close in 3s
    };

    const alertAPI = {
        success: (msg: string) => show('success', msg),
        error: (msg: string) => show('error', msg),
        warn: (msg: string) => show('warn', msg),
    };

    return (
        <AlertContext.Provider value={{ alert: alertAPI }}>
            {children}
            {alert && (
                <div className='alert-container'>
                    <div className={`alert alert-${alert.type}`}>
                        {alert.type === 'success' && <CircleCheck size={20} color='green' />}
                        {alert.type === 'error' && <span className="alert-icon">❌</span>}
                        {alert.type === 'warn' && <span className="alert-icon">⚠️</span>}
                        {alert.message}
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
}
