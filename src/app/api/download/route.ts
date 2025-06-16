import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ApiDownloadRequestSchema } from "@/lib/types"

const MARKETPLACE_API_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
const API_VERSION = "7.2-preview.1"
const USER_AGENT = "Offline VSIX web/1.0"

export async function POST(request: NextRequest) {
  let requestBody: z.infer<typeof ApiDownloadRequestSchema>

  try {
    const json = await request.json()
    requestBody = ApiDownloadRequestSchema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Invalid request body: ${error.errors.map(e => e.message).join(", ")}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { extensionIdentifier, version: specificVersion } = requestBody
  const [publisher, extensionName] = extensionIdentifier.split(".")

  const payload = {
    filters: [{ criteria: [{ filterType: 7, value: extensionIdentifier }] }],
    flags: 914,
  }

  try {
    const apiResponse = await fetch(MARKETPLACE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json;api-version=${API_VERSION}`,
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      return NextResponse.json(
        { error: `Marketplace API request failed: ${apiResponse.status} ${errorText}` },
        { status: 502 }
      )
    }

    const data = await apiResponse.json()
    const extension = data?.results?.[0]?.extensions?.[0]

    if (!extension) {
      return NextResponse.json({ error: "Extension not found." }, { status: 404 })
    }

    const versionData =
      extension.versions.find((v: { version: string }) => v.version === specificVersion) ||
      extension.versions[0]
    
    const version = versionData?.version

    if (!version) {
      return NextResponse.json(
        { error: "Could not determine extension version." },
        { status: 404 }
      )
    }
    
    const asset = versionData.files.find(
      (f: any) => f.assetType === "Microsoft.VisualStudio.Services.VSIXPackage"
    );

    if (!asset?.source) {
        return NextResponse.json({ error: "Could not find VSIX package asset." }, { status: 404 });
    }

    const downloadUrl = asset.source;
    const fileName = `${extensionIdentifier}-${version}.vsix`

    return NextResponse.json({ fileName, version, downloadUrl })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}