'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context.alert;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<Alert | null>(null);

  const show = (type: AlertType, message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 2000); // auto close
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
        <div className="fixed top-0 right-0 w-screen flex flex-col items-end z-[99999]">
          <div
            className={`
              fixed top-14 right-12 px-4 py-2 rounded-xl text-base flex items-center gap-2
              max-w-[90vw] w-max text-center shadow-lg animate-fadeInOut
              bg-gradient-to-r from-[#D6E2FB] to-[#E3EBFD]
              border-2
              ${
                alert.type === 'success'
                  ? 'border-green-500'
                  : alert.type === 'error'
                  ? 'border-red-500'
                  : 'border-yellow-400'
              }
            `}
          >
            {alert.type === 'success' && <CircleCheck size={20} className="text-green-600" />}
            {alert.type === 'error' && <span className="text-red-500">❌</span>}
            {alert.type === 'warn' && <span className="text-yellow-500">⚠️</span>}
            {alert.message}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
