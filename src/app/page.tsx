"use client"

import React, { useState, useTransition, useEffect, useCallback } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { ExtensionSearchResult, InitialData, ApiSearchResponseSchema } from "@/lib/types"
import { useQueue } from "@/context/queue-context"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLoader, SkeletonRow } from "@/components/ui/loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExtensionCard } from "@/components/ExtensionCard"
import { processMarketplaceExtensions, API_QUERY_FLAGS } from "@/lib/marketplace-utils"

const MARKETPLACE_API_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
const API_VERSION = "7.2-preview.1";
const USER_AGENT = "VSIX-Downloader-Web/1.0";

const SearchFormSchema = z.object({
  searchTerm: z.string().min(2, { message: "Search term must be at least 2 characters." }),
})
type SearchFormValues = z.infer<typeof SearchFormSchema>

const MasonryGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {children}
  </div>
);

function HomePageContent() {
  const [isSearching, startSearchTransition] = useTransition()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<Partial<InitialData>>({});
  const [searchResults, setSearchResults] = useState<ExtensionSearchResult[] | null>(null)

  const { isQueued, toggleQueue } = useQueue();

  const searchForm = useForm<SearchFormValues>({ resolver: zodResolver(SearchFormSchema) })

  useEffect(() => {
    let isCancelled = false;

    async function loadCategory(
      category: keyof InitialData,
      sortBy: number
    ) {
      const payload = {
        filters: [
          {
            criteria: [{ filterType: 8, value: "Microsoft.VisualStudio.Code" }],
            pageSize: 12,
            pageNumber: 1,
            sortBy,
          },
        ],
        flags: API_QUERY_FLAGS,
      };

      try {
        const response = await fetch(MARKETPLACE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: `application/json;api-version=${API_VERSION}`,
            "User-Agent": USER_AGENT,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Marketplace API request failed: ${response.status}`);
        }

        const data = await response.json();
        const extensions = processMarketplaceExtensions(
          data?.results?.[0]?.extensions || []
        );

        if (!isCancelled) {
          setInitialData(prev => ({ ...prev, [category]: extensions }));
        }
      } catch (err) {
        if (!isCancelled) {
          setError(prev => prev ?? `Failed to load ${category}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    }

    setIsInitialLoading(true);
    setError(null);

    loadCategory("popular", 4);
    loadCategory("featured", 12);
    loadCategory("recent", 10);

    const timeout = setTimeout(() => {
      if (!isCancelled) setIsInitialLoading(false);
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, []);


  const handleSearch: SubmitHandler<SearchFormValues> = ({ searchTerm }) => {
    startSearchTransition(async () => {
      setSearchResults(null);
      setError(null);
      try {
        const payload = {
          filters: [
            {
              criteria: [
                { filterType: 10, value: searchTerm },
                { filterType: 8, value: "Microsoft.VisualStudio.Code" },
              ],
              pageSize: 50,
              pageNumber: 1,
              sortBy: 4,
              sortOrder: 0,
            },
          ],
          flags: API_QUERY_FLAGS,
        };

        const response = await fetch(MARKETPLACE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: `application/json;api-version=${API_VERSION}`,
            "User-Agent": USER_AGENT,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Marketplace API search failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const extensions = data?.results?.[0]?.extensions || [];
        const enrichedResults = processMarketplaceExtensions(extensions);
        const validatedResults = ApiSearchResponseSchema.parse(enrichedResults);

        setSearchResults(validatedResults);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred during search.");
      }
    });
  };

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    searchForm.reset();
  }, [searchForm]);

  const renderContent = () => {
    if (error) return <Alert variant="destructive"><Icons.warning className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>

    if (searchResults !== null) {
      return (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Search Results</h2>
            <Button variant="ghost" onClick={clearSearch}><Icons.close className="h-4 w-4 mr-2" />Clear</Button>
          </div>
          <MasonryGrid>
            {isSearching ? [...Array(12)].map((_, i) => <SkeletonRow key={i} />) :
              (searchResults.length > 0 ? searchResults.map(ext => <ExtensionCard key={ext.id} ext={ext} onQueueToggle={toggleQueue} isQueued={isQueued(ext.id)} />) : <p className="col-span-full p-8 text-center text-muted-foreground">No extensions found for your search.</p>)
            }
          </MasonryGrid>
        </section>
      )
    }

    if (initialData) {
      return (
        <div className="space-y-12">
          {Object.entries(initialData).map(([category, extensions]) => (
            <section key={category}>
              <h2 className="inline-block text-2xl font-bold tracking-tight text-foreground capitalize mb-6 sm:text-3xl">{category}</h2>
              <MasonryGrid>
                {(extensions as ExtensionSearchResult[]).map(ext => <ExtensionCard key={ext.id} ext={ext} onQueueToggle={toggleQueue} isQueued={isQueued(ext.id)} />)}
              </MasonryGrid>
            </section>
          ))}
        </div>
      )
    }

    return null;
  }

  if (isInitialLoading) {
    return <PageLoader text="Loading extensions..." />
  }

  return (
    <main className="container relative mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">offvsix web</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">Your portal for offline VS Code extensions. Search, queue, and download <code>.vsix</code> files for any environment.</p>
        <form
          onSubmit={searchForm.handleSubmit(handleSearch)}
          className="mt-8 flex w-full max-w-lg mx-auto items-center gap-2"
        >
          <div className="relative flex-grow">
            <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              {...searchForm.register("searchTerm")}
              placeholder="Search by name or publisher..."
              disabled={isSearching}
              className="h-12 text-base pl-12 w-full"
            />
          </div>
        </form>

      </div>
      {renderContent()}
    </main>
  )
}

export default HomePageContent;
