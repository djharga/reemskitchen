/**
 * English dictionary. UI strings flow through here so that adding
 * Arabic/French later means translating this file, not editing markup.
 * (Store data — product names, descriptions — lives in the database.)
 */
const en = {
  nav: {
    home: "Home",
    shop: "Shop",
    findUs: "Find Us",
    about: "About",
    search: "Search",
    account: "Account",
    cart: "Cart",
  },
  product: {
    priceComingSoon: "Price coming soon",
    contactForPrice: "Contact for price",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    soldOut: "Sold Out",
    available: "Available",
    availableThisWeek: "Available this week",
    vegan: "Vegan",
    vegetarian: "Vegetarian",
    quickView: "Quick View",
    quantity: "Quantity",
    ingredients: "Ingredients",
    allergens: "Allergens",
    storage: "Storage",
    servingReheating: "Serving & reheating",
    shelfLife: "Enjoy by",
    spiceLevel: "Spice level",
    youMayAlsoLike: "You may also like",
    frequentlyBoughtTogether: "Goes well with",
    reviews: "Reviews",
  },
  cart: {
    title: "Your Cart",
    empty: "Your cart is empty",
    emptyHint: "Fresh breads, dips and sweets are waiting in the shop.",
    browseShop: "Browse the shop",
    orderNote: "Order note (optional)",
    subtotal: "Subtotal",
    priceAtPickup: "Some prices will be confirmed before pickup.",
    checkout: "Checkout",
    remove: "Remove",
  },
  checkout: {
    title: "Checkout",
    contact: "Your details",
    pickup: "Pickup",
    payment: "Payment",
    payAtPickup: "Pre-order — pay at pickup",
    payAtPickupHint:
      "Pay by card or cash when you collect your order at the market.",
    placeOrder: "Place Pre-order",
    orderSummary: "Order summary",
  },
  common: {
    loading: "Loading…",
    clearFilters: "Clear filters",
    noResults: "No products match these filters.",
    announcedSoon: "Our next market location will be announced soon.",
  },
};

export type Dictionary = typeof en;
export default en;
