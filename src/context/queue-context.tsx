"use client"

import React, { createContext, useContext } from 'react';
import { useDownloadQueue } from '@/hooks/use-download-queue';

type QueueContextType = ReturnType<typeof useDownloadQueue>;

const QueueContext = createContext<QueueContextType | null>(null);

export function useQueue() {
    const context = useContext(QueueContext);
    if (!context) {
        throw new Error("useQueue must be used within a QueueProvider");
    }
    return context;
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
    const queue = useDownloadQueue();
    return (
        <QueueContext.Provider value={queue}>
            {children}
        </QueueContext.Provider>
    );
}
