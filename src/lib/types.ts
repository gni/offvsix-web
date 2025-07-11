import { z } from "zod"

export const ExtensionIdentifierSchema = z
    .string()
    .min(3, { message: "Identifier must be at least 3 characters long." })
    .regex(/^[a-z0-9-]+\.[a-z0-9-]+$/i, {
        message: 'Invalid format. Use "publisher.extension-name".',
    })

export const ApiDownloadRequestSchema = z.object({
    extensionIdentifier: ExtensionIdentifierSchema,
    version: z.string().optional(),
})

export const ApiSearchRequestSchema = z.object({
    searchTerm: z
        .string()
        .min(2, { message: "Search term must be at least 2 characters." }),
})

export const ExtensionSearchResultSchema = z.object({
    id: ExtensionIdentifierSchema,
    name: z.string(),
    publisher: z.string(),
    description: z.string(),
    iconUrl: z.string().url(),
    marketplaceUrl: z.string().url(),
    isVerified: z.boolean(),
    installCount: z.number().nullable(),
})

export const ApiSearchResponseSchema = z.array(ExtensionSearchResultSchema)

export type ExtensionSearchResult = z.infer<typeof ExtensionSearchResultSchema>

export const ApiResponseSuccessSchema = z.object({
    fileName: z.string(),
    version: z.string(),
    downloadUrl: z.string().url(),
})

export const ApiResponseErrorSchema = z.object({
    error: z.string(),
})

export type ApiDownloadResponse = z.infer<typeof ApiResponseSuccessSchema>
export type ApiErrorResponse = z.infer<typeof ApiResponseErrorSchema>

export type InitialData = {
    featured: ExtensionSearchResult[],
    popular: ExtensionSearchResult[],
    // recent: ExtensionSearchResult[]
}