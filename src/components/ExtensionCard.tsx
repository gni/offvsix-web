"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { ExtensionSearchResult } from '@/lib/types';

function formatNumber(num: number | null | undefined): string {
    if (num == null) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${Math.floor(num / 1_000)}k`;
    return num.toString();
}

export const ExtensionCard = React.memo(function ExtensionCard({ ext, isQueued, onQueueToggle }: { ext: ExtensionSearchResult; isQueued: boolean; onQueueToggle: (ext: ExtensionSearchResult) => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-4 transition-colors",
                isQueued ? 'bg-queued' : 'hover:bg-accent'
            )}
        >
            <div className="flex flex-grow items-start gap-4">
                <Image src={ext.iconUrl} alt={`${ext.name} icon`} width={48} height={48} className="h-12 w-12 flex-shrink-0 rounded-md border" />
                <div className="flex-1 overflow-hidden">
                    <a href={ext.marketplaceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground line-clamp-2 hover:underline">{ext.name}</a>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span>{ext.publisher}</span>
                        {ext.isVerified && <Icons.shieldCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />}
                    </div>
                </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3 h-[60px]">{ext.description}</p>
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground" title={`${ext.installCount?.toLocaleString() ?? '0'} installs`}>
                    <Icons.download className="h-4 w-4" />
                    <span>{formatNumber(ext.installCount)}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0 rounded-full cursor-pointer" onClick={() => onQueueToggle(ext)}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {isQueued ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                                <Icons.checkCircle2 className="h-5 w-5 text-green-500" />
                            </motion.div>
                        ) : (
                            <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                                <Icons.plusCircle className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </div>
        </motion.div>
    );
});
