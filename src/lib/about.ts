import { items } from "@wix/data";
import { auth } from "@wix/essentials";
import { resolveWixImageUrl } from "../utils/wix-image";
import { renderCmsRichText } from "./cms-rich-text";

// Exact collection id from .wix/seeded.json (cms.collectionIds.about)
const COLLECTION_ID = "About";

export interface AboutContent {
  _id: string;
  heading: string;
  bodyHtml: string;
  imageUrl?: string;
}

export async function queryAboutContent(): Promise<AboutContent | null> {
  try {
    const elevatedQuery = auth.elevate(items.query);
    const { items: results } = await elevatedQuery(COLLECTION_ID).limit(1).find();
    const item = results[0];
    if (!item) return null;

    return {
      _id: item._id as string,
      heading: (item.heading as string) ?? "",
      bodyHtml: renderCmsRichText(item.body),
      imageUrl:
        resolveWixImageUrl(item.image as string | undefined, 960, 720) ??
        undefined,
    };
  } catch (err) {
    console.error(`[cms:${COLLECTION_ID}] query failed:`, err);
    return null;
  }
}
