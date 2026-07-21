-- ============================================================
-- Reem's Kitchen — replaceable starter (demo) data
-- Run after 0001_schema.sql.
--
-- All rows are flagged is_demo = true where applicable so the
-- admin panel can label them. Customers never see the word
-- "Demo". Prices are intentionally NULL (never invent prices):
-- the storefront shows "Price coming soon" until real prices
-- are added from the admin panel.
--
-- No locations, schedules, phone numbers, or addresses are
-- seeded — those must be real and are added from /admin.
-- ============================================================

-- Settings singleton -----------------------------------------------------
insert into public.site_settings (id, store_name, tagline, announcement_text, announcement_href, seo_title, seo_description)
values (
  1,
  'Reem''s Kitchen',
  'Fresh Middle Eastern food, handmade in Calgary',
  'Find us this Saturday at the Farmers'' Market',
  '/find-us',
  'Reem''s Kitchen | Fresh Middle Eastern Food, Handmade in Calgary',
  'Handmade Middle Eastern breads, savoury pastries, dips and sweets prepared in small batches for Calgary farmers'' markets. Pre-order online, pick up at the market.'
)
on conflict (id) do nothing;

-- Content blocks ----------------------------------------------------------
insert into public.content_blocks (key, title, body, extra) values
('hero',
 'Fresh Middle Eastern Food, Handmade in Calgary',
 'Handmade breads, savoury pastries, dips and sweets prepared in small batches for Calgary farmers'' markets.',
 '{"primary_cta": "Shop the Menu", "primary_href": "/shop", "secondary_cta": "Find Us This Week", "secondary_href": "/find-us"}'::jsonb),
('story',
 'From Reem''s Kitchen to Your Table',
 'Reem''s Kitchen started with recipes passed down through a Middle Eastern family kitchen — fresh naan on the stove, trays of baklava for guests, and dips made from scratch. Today, everything is still made by hand in small batches and brought fresh to Calgary''s farmers'' markets, where we get to meet the people we bake for. [Placeholder text — replace with Reem''s real story from the admin panel.]',
 '{}'::jsonb),
('custom_orders',
 'Bundles & Party Orders',
 'Feeding a crowd? We prepare boxes for gatherings, family dinners, celebrations and office events. Tell us what you need and we''ll build a box together.',
 '{"cta": "Request a Custom Order"}'::jsonb),
('faq', 'Frequently Asked Questions', null,
 '{"items": [
   {"q": "How does pickup work?", "a": "Place a pre-order online, choose a market location and time, and pick up your order at our stall. Payment is taken at pickup unless online payment is enabled."},
   {"q": "Is everything really handmade?", "a": "Yes — every item is prepared by hand in small batches, fresh for each market."},
   {"q": "Do you have vegan options?", "a": "Yes. Look for the green Vegan badge, or browse the Vegan section of the shop."}
 ]}'::jsonb),
('policies', 'Policies',
 'Pre-orders can be cancelled up to the pre-order deadline for each market. Please bring your order number to pickup. [Placeholder — edit from Admin > Content.]',
 '{}'::jsonb)
on conflict (key) do nothing;

-- Categories ---------------------------------------------------------------
insert into public.categories (slug, name, description, sort_order, is_visible) values
('breads', 'Fresh Breads & Focaccia', 'Naan, focaccia and stuffed breads, baked fresh for every market.', 1, true),
('savoury', 'Savoury Pastries', 'Baked samosas, spinach rolls and other savoury bites.', 2, true),
('dips', 'Dips & Appetizers', 'Hummus, baba ghanoush and fresh appetizers made from scratch.', 3, true),
('sweets', 'Sweets & Baklava', 'Homemade baklava and cookies for every sweet tooth.', 4, true),
('vegan', 'Vegan Products', 'Plant-based breads, dips and sweets — full flavour, no compromise.', 5, true),
('bundles', 'Bundles', 'Curated boxes for tastings, families, parties and events.', 6, true);

-- Products (prices intentionally NULL) --------------------------------------
with c as (select slug, id from public.categories)
insert into public.products
  (slug, name, short_description, description, category_id, is_vegan, is_vegetarian, is_featured, available_this_week, tags, ingredients, allergens, storage_instructions, serving_instructions, shelf_life, is_demo)
values
-- Breads & Focaccia
('fresh-naan', 'Fresh Naan', 'Soft, pillowy naan baked fresh for every market.',
 'Our naan is mixed, proofed and baked by hand in small batches. Perfect with dips, stews, or on its own while it''s still warm.',
 (select id from c where slug = 'breads'), false, true, true, true,
 array['bread'], array['flour', 'water', 'yeast', 'salt', 'olive oil'], array['gluten'],
 'Keep in a sealed bag at room temperature.', 'Warm 2-3 minutes in the oven at 350°F before serving.', 'Best within 3 days', true),
('focaccia', 'Focaccia', 'Olive-oil rich focaccia with a golden, crisp crust.',
 'A slow-proofed focaccia finished with olive oil and sea salt. Great for sandwiches or alongside dinner.',
 (select id from c where slug = 'breads'), true, true, true, true,
 array['bread'], array['flour', 'water', 'yeast', 'olive oil', 'sea salt'], array['gluten'],
 'Room temperature in a sealed bag.', 'Refresh in a hot oven for 3-4 minutes.', 'Best within 3 days', true),
('cheese-bread', 'Cheese Bread', 'Soft bread filled with melty cheese.',
 'A family favourite — soft dough wrapped around a generous cheese filling and baked until golden.',
 (select id from c where slug = 'breads'), false, true, true, true,
 array['bread', 'cheese'], array['flour', 'cheese', 'yeast', 'milk', 'salt'], array['gluten', 'dairy'],
 'Refrigerate in a sealed container.', 'Warm 4-5 minutes in the oven at 350°F.', 'Best within 3 days', true),
('vegan-cheese-bread', 'Vegan Cheese Bread', 'All the comfort of cheese bread — fully plant-based.',
 'Our signature cheese bread made with plant-based cheese. Just as melty, completely vegan.',
 (select id from c where slug = 'breads'), true, true, false, true,
 array['bread', 'vegan'], array['flour', 'plant-based cheese', 'yeast', 'salt'], array['gluten'],
 'Refrigerate in a sealed container.', 'Warm 4-5 minutes in the oven at 350°F.', 'Best within 3 days', true),
('pesto-bread', 'Pesto Bread', 'Swirled with fresh basil pesto.',
 'Soft bread swirled with a fragrant basil pesto — lovely with soups and salads.',
 (select id from c where slug = 'breads'), false, true, false, true,
 array['bread'], array['flour', 'basil', 'olive oil', 'garlic', 'parmesan', 'yeast'], array['gluten', 'dairy'],
 'Room temperature in a sealed bag.', 'Serve at room temperature or lightly warmed.', 'Best within 3 days', true),
-- Savoury Pastries
('baked-samosas', 'Baked Samosas', 'Golden baked samosas with a spiced vegetable filling.',
 'Baked — not fried — samosas filled with spiced potatoes and peas. A market favourite that sells out early.',
 (select id from c where slug = 'savoury'), true, true, true, true,
 array['pastry', 'spiced'], array['flour', 'potato', 'peas', 'onion', 'spices'], array['gluten'],
 'Refrigerate in a sealed container.', 'Reheat 8-10 minutes at 375°F for the crispiest shell.', 'Best within 3 days', true),
('spinach-rolls', 'Spinach Rolls', 'Flaky rolls filled with lemony spinach.',
 'Hand-rolled pastry with a bright spinach, onion and sumac filling — a Levantine classic.',
 (select id from c where slug = 'savoury'), true, true, true, true,
 array['pastry'], array['flour', 'spinach', 'onion', 'sumac', 'olive oil', 'lemon'], array['gluten'],
 'Refrigerate in a sealed container.', 'Reheat 6-8 minutes at 350°F.', 'Best within 3 days', true),
-- Dips & Appetizers
('hummus', 'Hummus', 'Silky-smooth hummus made from scratch.',
 'Chickpeas, tahini, lemon and garlic — blended until completely smooth. No shortcuts, no preservatives.',
 (select id from c where slug = 'dips'), true, true, true, true,
 array['dip', 'protein'], array['chickpeas', 'tahini', 'lemon', 'garlic', 'olive oil', 'salt'], array['sesame'],
 'Keep refrigerated.', 'Drizzle with olive oil and serve with warm naan.', 'Refrigerated: 5 days', true),
('baba-ghanoush', 'Baba Ghanoush', 'Smoky roasted eggplant dip.',
 'Eggplant roasted until smoky, then folded with tahini, lemon and garlic.',
 (select id from c where slug = 'dips'), true, true, false, true,
 array['dip'], array['eggplant', 'tahini', 'lemon', 'garlic', 'olive oil'], array['sesame'],
 'Keep refrigerated.', 'Serve at room temperature with bread or vegetables.', 'Refrigerated: 4 days', true),
-- Sweets
('homemade-baklava', 'Homemade Baklava', 'Layers of crisp phyllo, nuts and fragrant syrup.',
 'Made the traditional way — thin layers of phyllo brushed with butter, filled with nuts and finished with fragrant syrup.',
 (select id from c where slug = 'sweets'), false, true, true, true,
 array['dessert'], array['phyllo', 'walnuts', 'pistachios', 'butter', 'sugar', 'rose water'], array['gluten', 'nuts', 'dairy'],
 'Room temperature in a sealed container.', 'Serve at room temperature.', 'Best within 7 days', true),
('date-cookies', 'Date Cookies', 'Buttery cookies filled with soft date paste (ma''amoul style).',
 'Delicate semolina cookies filled with cinnamon-scented date paste — made for sharing with coffee or tea.',
 (select id from c where slug = 'sweets'), false, true, false, true,
 array['dessert', 'cookies'], array['semolina', 'flour', 'dates', 'butter', 'cinnamon'], array['gluten', 'dairy'],
 'Room temperature in a sealed container.', 'Serve with coffee or tea.', 'Best within 10 days', true),
('chocolate-cookies', 'Chocolate Cookies', 'Soft-baked chocolate cookies.',
 'Rich, soft-baked chocolate cookies — the kids'' favourite at every market.',
 (select id from c where slug = 'sweets'), false, true, false, true,
 array['dessert', 'cookies'], array['flour', 'cocoa', 'chocolate', 'butter', 'sugar', 'eggs'], array['gluten', 'dairy', 'eggs'],
 'Room temperature in a sealed container.', null, 'Best within 7 days', true),
-- Bundles
('bread-bundle', 'Bread Bundle', 'A trio of our fresh-baked breads.',
 'Pick up a bundle of our market breads — great for the week ahead or for the freezer.',
 (select id from c where slug = 'bundles'), false, true, false, true,
 array['bundle'], null, array['gluten'], null, null, null, true),
('middle-eastern-tasting-box', 'Middle Eastern Tasting Box', 'A little bit of everything we make.',
 'A curated introduction to Reem''s Kitchen: bread, a dip, savoury pastries and a few sweets.',
 (select id from c where slug = 'bundles'), false, true, true, true,
 array['bundle', 'gift'], null, array['gluten', 'sesame', 'nuts', 'dairy'], null, null, null, true),
('party-box', 'Party Box', 'Feeds a crowd — built for gatherings and events.',
 'A generous spread of breads, dips, pastries and sweets, portioned for parties, family gatherings and office events.',
 (select id from c where slug = 'bundles'), false, true, false, true,
 array['bundle', 'party'], null, array['gluten', 'sesame', 'nuts', 'dairy'], null, null, null, true),
('vegan-selection', 'Vegan Selection', 'Our favourite plant-based items in one box.',
 'Fully plant-based box: focaccia, hummus, baba ghanoush, baked samosas and spinach rolls.',
 (select id from c where slug = 'bundles'), true, true, false, true,
 array['bundle', 'vegan'], null, array['gluten', 'sesame'], null, null, null, true);

-- Fix column count mismatch guard: the three bundle rows above pass
-- storage/serving/shelf_life as null, null, null then is_demo true — verified.

-- Variants (sizes/options) — prices intentionally NULL ----------------------
insert into public.product_variants (product_id, name, is_default, sort_order) values
((select id from public.products where slug = 'hummus'), 'Small tub', true, 1),
((select id from public.products where slug = 'hummus'), 'Large tub', false, 2),
((select id from public.products where slug = 'baba-ghanoush'), 'Small tub', true, 1),
((select id from public.products where slug = 'baba-ghanoush'), 'Large tub', false, 2),
((select id from public.products where slug = 'homemade-baklava'), 'Small box', true, 1),
((select id from public.products where slug = 'homemade-baklava'), 'Large box', false, 2),
((select id from public.products where slug = 'party-box'), 'Serves 8-10', true, 1),
((select id from public.products where slug = 'party-box'), 'Serves 15-20', false, 2);
