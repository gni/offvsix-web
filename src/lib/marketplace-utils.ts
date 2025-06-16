import { ExtensionSearchResult } from "@/lib/types";

export const API_QUERY_FLAGS = 914;
const DEFAULT_ICON = "https://cdn.vsassets.io/v/M257_20250527.11/_content/Header/default_icon_128.png";

export function processMarketplaceExtensions(
  extensions: any[]
): ExtensionSearchResult[] {
  if (!Array.isArray(extensions)) {
    return [];
  }

  return extensions
    .map((ext): ExtensionSearchResult | null => {
      try {
        const publisherName = ext.publisher?.publisherName;
        const extensionName = ext.extensionName;
        if (!publisherName || !extensionName) {
          return null;
        }

        const id = `${publisherName}.${extensionName}`;

        const isVerified = ext.publisher?.isDomainVerified === true;

        const latestVersion = ext.versions?.[0];
        if (!latestVersion) {
          return null;
        }

        const iconAsset = latestVersion.files?.find(
          (f: any) => f.assetType === "Microsoft.VisualStudio.Services.Icons.Default"
        );

        const installStat = (ext.statistics || []).find(
          (s: any) => s.statisticName === "install"
        );

        return {
          id,
          name: ext.displayName || "Unknown Name",
          publisher: ext.publisher.displayName || "Unknown Publisher",
          description: ext.shortDescription || "No description available.",
          iconUrl: iconAsset?.source || DEFAULT_ICON,
          marketplaceUrl: `https://marketplace.visualstudio.com/items?itemName=${id}`,
          isVerified,
          installCount: installStat ? installStat.value : 0,
        };
      } catch {
        return null;
      }
    })
    .filter((ext): ext is ExtensionSearchResult => ext !== null);
}
