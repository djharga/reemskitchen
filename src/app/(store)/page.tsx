import {
  getApprovedReviews,
  getCategories,
  getContentBlocks,
  getFeaturedProducts,
  getProducts,
  getUpcomingSchedules,
  getVeganProducts,
} from "@/lib/queries";
import {
  BundlesSection,
  CategoryCards,
  FeaturedProducts,
  Hero,
  MarketWeek,
  NewsletterSection,
  ReviewsSection,
  StorySection,
  VeganSection,
} from "@/components/store/home-sections";

export const revalidate = 300; // refresh home content every 5 minutes

export default async function HomePage() {
  const [content, categories, featured, vegan, schedules, reviews, bundles] =
    await Promise.all([
      getContentBlocks(),
      getCategories(),
      getFeaturedProducts(8),
      getVeganProducts(4),
      getUpcomingSchedules(2),
      getApprovedReviews(undefined, 6),
      getProducts({ category: "bundles" }),
    ]);

  return (
    <>
      <Hero block={content.hero} />
      <CategoryCards categories={categories} />
      <FeaturedProducts products={featured} />
      <MarketWeek schedules={schedules} />
      <VeganSection products={vegan} />
      <StorySection block={content.story} />
      <BundlesSection block={content.custom_orders} products={bundles} />
      <ReviewsSection reviews={reviews} />
      <NewsletterSection />
    </>
  );
}
