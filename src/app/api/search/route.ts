import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ApiSearchRequestSchema, ApiSearchResponseSchema } from "@/lib/types"
import { processMarketplaceExtensions, API_QUERY_FLAGS } from "@/lib/marketplace-utils"

const MARKETPLACE_API_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
const PAGE_SIZE = 50
const API_VERSION = "7.2-preview.1"
const USER_AGENT = "Offline VSIX web/1.0"

export async function POST(request: NextRequest) {
  let requestBody: z.infer<typeof ApiSearchRequestSchema>
  try {
    requestBody = ApiSearchRequestSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const payload = {
    filters: [
      {
        criteria: [
          { filterType: 10, value: requestBody.searchTerm },
          { filterType: 8, value: "Microsoft.VisualStudio.Code" },
        ],
        pageSize: PAGE_SIZE,
        pageNumber: 1,
        sortBy: 4,
        sortOrder: 0,
      },
    ],
    flags: API_QUERY_FLAGS,
  }

  try {
    const marketplaceResponse = await fetch(MARKETPLACE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json;api-version=${API_VERSION}`,
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(payload),
    })

    if (!marketplaceResponse.ok) {
      const errorText = await marketplaceResponse.text()
      return NextResponse.json(
        { error: `Marketplace API error: ${marketplaceResponse.status} ${errorText}` },
        { status: 502 }
      )
    }

    const data = await marketplaceResponse.json()
    const extensions = data?.results?.[0]?.extensions || []
    const enrichedResults = processMarketplaceExtensions(extensions)
    const validatedResults = ApiSearchResponseSchema.parse(enrichedResults)

    return NextResponse.json(validatedResults)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown internal error occurred"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
