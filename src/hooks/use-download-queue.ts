"use client"

import { useState, useCallback, useMemo } from "react"
import { ExtensionSearchResult, ApiDownloadResponse } from "@/lib/types"
import JSZip from "jszip"

type DownloadStatus = "idle" | "fetching" | "zipping" | "downloading" | "error"
type DownloadProgress = {
  total: number
  current: number
  fileName: string
}

const MARKETPLACE_API_URL = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
const API_VERSION = "7.2-preview.1"
const USER_AGENT = "VSIX-Downloader-Web/1.0"
const API_QUERY_FLAGS_DOWNLOAD = 914;

async function triggerBrowserDownload(url: string, filename: string) {
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function useDownloadQueue() {
  const [queue, setQueue] = useState<Map<string, ExtensionSearchResult>>(
    new Map()
  )
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle")
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    total: 0,
    current: 0,
    fileName: "",
  })
  const [error, setError] = useState<string | null>(null)

  const toggleQueue = useCallback(
    (extension: ExtensionSearchResult) => {
      setQueue(prev => {
        const newQueue = new Map(prev)
        if (newQueue.has(extension.id)) {
          newQueue.delete(extension.id)
        } else {
          newQueue.set(extension.id, extension)
        }
        return newQueue
      })
    },
    []
  )

  const clearQueue = useCallback(() => {
    setQueue(new Map())
  }, [])

  const fetchDownloadInfo = useCallback(async (extensionIdentifier: string, specificVersion?: string): Promise<ApiDownloadResponse> => {
    const payload = {
      filters: [{ criteria: [{ filterType: 7, value: extensionIdentifier }] }],
      flags: API_QUERY_FLAGS_DOWNLOAD,
    };

    const apiResponse = await fetch(MARKETPLACE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json;api-version=${API_VERSION}`,
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Marketplace API request failed: ${apiResponse.status} ${errorText}`);
    }

    const data = await apiResponse.json();
    const extension = data?.results?.[0]?.extensions?.[0];

    if (!extension) {
      throw new Error("Extension not found.");
    }

    const versionData =
      extension.versions.find((v: { version: string }) => v.version === specificVersion) ||
      extension.versions[0];

    const version = versionData?.version;

    if (!version) {
      throw new Error("Could not determine extension version.");
    }

    const asset = versionData.files.find(
      (f: any) => f.assetType === "Microsoft.VisualStudio.Services.VSIXPackage"
    );

    if (!asset?.source) {
      throw new Error("Could not find VSIX package asset.");
    }

    const downloadUrl = asset.source;
    const fileName = `${extensionIdentifier}-${version}.vsix`;

    return { fileName, version, downloadUrl };
  }, []);

  const downloadAll = useCallback(async () => {
    if (queue.size === 0) return
    setDownloadStatus("fetching")
    setError(null)

    const items = Array.from(queue.values())

    try {
      if (items.length === 1) {
        const ext = items[0];
        const result = await fetchDownloadInfo(ext.id);
        await triggerBrowserDownload(result.downloadUrl, result.fileName);
        clearQueue();
      } else {
        const total = items.length
        setDownloadProgress({ total, current: 0, fileName: "" })

        const downloadPromises: Promise<ApiDownloadResponse>[] = items.map(ext =>
          fetchDownloadInfo(ext.id)
        );

        const results = await Promise.all(downloadPromises)

        setDownloadStatus("zipping")
        const zip = new JSZip()
        for (let i = 0; i < results.length; i++) {
          const file = results[i]
          setDownloadProgress({ total, current: i + 1, fileName: file.fileName })
          const response = await fetch(file.downloadUrl)
          if (!response.ok) throw new Error(`Failed to download ${file.fileName}`)
          const blob = await response.blob()
          zip.file(file.fileName, blob)
        }

        setDownloadStatus("downloading")
        const zipBlob = await zip.generateAsync({ type: "blob" })
        const zipUrl = URL.createObjectURL(zipBlob);
        await triggerBrowserDownload(zipUrl, `vsix-extensions-${Date.now()}.zip`);
        URL.revokeObjectURL(zipUrl);
        clearQueue()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during download.")
      setDownloadStatus("error")
    } finally {
      setDownloadStatus("idle")
    }
  }, [queue, clearQueue, fetchDownloadInfo])

  const queuedItems = useMemo(() => Array.from(queue.values()), [queue])

  return {
    queue,
    queuedItems,
    toggleQueue,
    isQueued: useCallback(
      (id: string) => queue.has(id),
      [queue]
    ),
    clearQueue,
    downloadAll,
    downloadStatus,
    downloadProgress,
    error,
  }
}