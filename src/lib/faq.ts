import { items } from "@wix/data";
import { auth } from "@wix/essentials";
import { renderCmsRichText } from "./cms-rich-text";

// Exact collection id from .wix/seeded.json (cms.collectionIds.faq)
const COLLECTION_ID = "FAQ";

export interface FaqItem {
  _id: string;
  question: string;
  answerHtml: string;
  sortOrder: number;
}

export async function queryFaqItems(): Promise<FaqItem[]> {
  try {
    const elevatedQuery = auth.elevate(items.query);
    const { items: results } = await elevatedQuery(COLLECTION_ID)
      .ascending("sortOrder")
      .limit(50)
      .find();

    return results.map((item) => ({
      _id: item._id as string,
      question: (item.question as string) ?? "",
      answerHtml: renderCmsRichText(item.answer),
      sortOrder: Number(item.sortOrder ?? 0),
    }));
  } catch (err) {
    console.error(`[cms:${COLLECTION_ID}] query failed:`, err);
    return [];
  }
}
