import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getPostBySlug } from "@/lib/posts";
import { categoryByKey } from "@/lib/categories";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Tara Bucket story";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return renderOgCard({ kicker: "The journal", title: "Tara Bucket" });
  }

  const cat = categoryByKey(post.category);
  return renderOgCard({
    kicker: cat?.label ?? "The journal",
    title: post.title,
    subtitle: post.excerpt ?? undefined,
    accent: cat?.color,
  });
}
