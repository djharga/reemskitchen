import { getCategories, getSettings } from "@/lib/queries";
import { CartProvider } from "@/components/store/cart/cart-provider";
import { CartDrawer } from "@/components/store/cart/cart-drawer";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);

  return (
    <CartProvider>
      <LocalBusinessJsonLd settings={settings} />
      <AnnouncementBar settings={settings} />
      <Header settings={settings} categories={categories} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} categories={categories} />
      <CartDrawer />
    </CartProvider>
  );
}
