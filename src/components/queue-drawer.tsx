"use client";

import React from 'react';
import Image from 'next/image';
import { useQueue } from '@/context/queue-context';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Loader } from '@/components/ui/loader';
import { Icons } from '@/components/icons';

export function QueueDrawer() {
    const {
        queuedItems,
        toggleQueue,
        downloadAll,
        downloadStatus,
        downloadProgress,
        error: downloadError,
    } = useQueue();

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full font-semibold shadow-sm">
                    <Icons.shoppingCart className="mr-2 h-5 w-5" />
                    Queue
                    {queuedItems.length > 0 && (
                        <span className="ml-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {queuedItems.length}
                        </span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="p-0 flex flex-col h-full bg-background">
                <DrawerHeader className="border-b p-4">
                    <DrawerTitle>Download Queue ({queuedItems.length})</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    {queuedItems.length > 0 ? (
                        queuedItems.map(ext => (
                            <div key={`queue-${ext.id}`} className="flex items-center justify-between text-sm animate-in fade-in">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Image src={ext.iconUrl} alt="" width={32} height={32} className="h-8 w-8 rounded flex-shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-foreground truncate">{ext.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{ext.publisher}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 cursor-pointer" onClick={() => toggleQueue(ext)} aria-label={`Remove ${ext.name} from queue`}>
                                    <Icons.close className="h-4 w-4 text-muted-foreground/80" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Icons.shoppingCart className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-lg font-semibold">Your Queue is Empty</p>
                            <p className="mt-1 text-sm text-muted-foreground">Add extensions to see them here.</p>
                        </div>
                    )}
                    {downloadStatus !== 'idle' && (
                        <div className="w-full text-center mb-4 space-y-2">
                            <Loader text={
                                downloadStatus === 'fetching'
                                    ? `Fetching metadata...`
                                    : downloadStatus === 'zipping'
                                        ? `Zipping ${downloadProgress.current}/${downloadProgress.total}: ${downloadProgress.fileName}`
                                        : `Preparing download...`
                            } />

                            {downloadStatus === 'zipping' && (
                                <progress
                                    className="w-full h-2 appearance-none bg-muted [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary rounded"
                                    max={downloadProgress.total}
                                    value={downloadProgress.current}
                                />
                            )}
                        </div>
                    )}

                </div>
                <DrawerFooter className="pt-4 border-t bg-background flex flex-col sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse space-y-2 sm:space-y-0">
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full cursor-pointer">Close</Button>
                    </DrawerClose>
                    <Button size="lg" className="w-full cursor-pointer" onClick={downloadAll} disabled={queuedItems.length === 0 || downloadStatus !== 'idle'}>
                        <Icons.fileDown className="h-5 w-5 mr-2 cursor-pointer" />
                        {queuedItems.length > 1 ? `Download All as .zip (${queuedItems.length})` : `Download Extension`}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
