"use client"

import React from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { QueueDrawer } from '@/components/queue-drawer';

export function HeaderActions() {
    return (
        <div className="flex items-center gap-2">
            <QueueDrawer />
            <ThemeSwitcher />
        </div>
    );
}
