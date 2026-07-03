export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  badge?: "NEW" | "SALE" | "HOT";
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const categories = [
  { id: "men", name: "Men", img: u("photo-1516257984-b1b4d707412e") },
  { id: "women", name: "Women", img: u("photo-1485231183945-fffde7cc051e") },
  { id: "shoes", name: "Shoes", img: u("photo-1542291026-7eec264c27ff") },
  { id: "watches", name: "Watches", img: u("photo-1524805444758-089113d48a6d") },
  { id: "bags", name: "Bags", img: u("photo-1548036328-c9fa89d128fa") },
  { id: "accessories", name: "Accessories", img: u("photo-1622434641406-a158123450f9") },
  { id: "hoodies", name: "Hoodies", img: u("photo-1556821840-3a63f95609a7") },
  { id: "perfumes", name: "Perfumes", img: u("photo-1541643600914-78b084683601") },
];

export const brands = [
  { id: "nike", name: "Nike" },
  { id: "zara", name: "Zara" },
  { id: "hm", name: "H&M" },
  { id: "adidas", name: "Adidas" },
  { id: "gucci", name: "Gucci" },
  { id: "puma", name: "Puma" },
];

export const banners = [
  {
    id: "b1",
    title: "Autumn Drop '26",
    subtitle: "Up to 50% off curated essentials",
    img: u("photo-1483985988355-763728e1935b"),
  },
  {
    id: "b2",
    title: "Chrono Luxury",
    subtitle: "Timeless elegance & Swiss precision",
    img: u("photo-1547996160-81dfa63595aa"),
  },
  {
    id: "b3",
    title: "Signature Scent",
    subtitle: "Exclusive French perfumes & colognes",
    img: u("photo-1594035910387-fea47794261f"),
  },
  {
    id: "b4",
    title: "Streetwear Edit",
    subtitle: "Fresh hoodies & retro sneakers",
    img: u("photo-1490481651871-ab68de25d43d"),
  },
  {
    id: "b5",
    title: "Luxe Accessories",
    subtitle: "Statement sunglasses & leather goods",
    img: u("photo-1572635196237-14b3f281503f"),
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Oversized Wool Coat",
    brand: "Zara",
    price: 189,
    oldPrice: 249,
    rating: 4.8,
    reviews: 234,
    category: "women",
    colors: ["#1a1a1a", "#c8a27a", "#8b1e1e"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      u("photo-1539109136881-3be0616acf4b"),
      u("photo-1551488831-00ddcb6c6bd3"),
      u("photo-1483985988355-763728e1935b"),
    ],
    description:
      "Tailored oversized coat in premium wool blend. Drop shoulder, notched lapel, and concealed front closure. Lined for warmth.",
    badge: "SALE",
  },
  {
    id: "p2",
    name: "Air Runner '92",
    brand: "Nike",
    price: 159,
    rating: 4.9,
    reviews: 1820,
    category: "shoes",
    colors: ["#ffffff", "#000000", "#ea580c"],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    images: [
      u("photo-1542291026-7eec264c27ff"),
      u("photo-1606107557195-0e29a4b5b4aa"),
      u("photo-1600185365483-26d7a4cc7519"),
    ],
    description:
      "Classic silhouette reimagined with breathable mesh, lightweight foam midsole, and rubber waffle outsole for everyday wear.",
    badge: "HOT",
  },
  {
    id: "p3",
    name: "Heritage Leather Tote",
    brand: "Gucci",
    price: 420,
    rating: 4.7,
    reviews: 89,
    category: "bags",
    colors: ["#3b1f0f", "#1a1a1a"],
    sizes: ["One Size"],
    images: [
      u("photo-1548036328-c9fa89d128fa"),
      u("photo-1584917865442-de89df76afd3"),
    ],
    description:
      "Hand-finished full-grain leather tote with structured silhouette, twin top handles, and signature hardware.",
  },
  {
    id: "p4",
    name: "Essential Hoodie",
    brand: "H&M",
    price: 49,
    oldPrice: 69,
    rating: 4.5,
    reviews: 512,
    category: "hoodies",
    colors: ["#1a1a1a", "#6b7280", "#ea580c"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      u("photo-1556821840-3a63f95609a7"),
      u("photo-1620799140408-edc6dcb6d633"),
    ],
    description:
      "Heavyweight cotton fleece hoodie with kangaroo pocket, ribbed cuffs, and adjustable drawstring hood.",
    badge: "SALE",
  },
  {
    id: "p5",
    name: "Chrono Steel Watch",
    brand: "Adidas",
    price: 229,
    rating: 4.6,
    reviews: 145,
    category: "watches",
    colors: ["#c0c0c0", "#1a1a1a", "#b8860b"],
    sizes: ["One Size"],
    images: [
      u("photo-1524805444758-089113d48a6d"),
      u("photo-1523275335684-37898b6baf30"),
    ],
    description:
      "Stainless steel chronograph with sapphire crystal, luminous indices, and water resistance up to 100m.",
  },
  {
    id: "p6",
    name: "Linen Summer Dress",
    brand: "Zara",
    price: 79,
    rating: 4.4,
    reviews: 320,
    category: "women",
    colors: ["#f5f1ea", "#1a1a1a"],
    sizes: ["XS", "S", "M", "L"],
    images: [
      u("photo-1485231183945-fffde7cc051e"),
      u("photo-1496747611176-843222e1e57c"),
    ],
    description: "Lightweight linen dress with adjustable straps and relaxed midi length.",
    badge: "NEW",
  },
  {
    id: "p7",
    name: "Selvedge Denim Jacket",
    brand: "Nike",
    price: 139,
    rating: 4.7,
    reviews: 278,
    category: "men",
    colors: ["#1e3a5f", "#1a1a1a"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      u("photo-1516257984-b1b4d707412e"),
      u("photo-1591047139829-d91aecb6caea"),
    ],
    description: "Raw selvedge denim trucker jacket built to fade beautifully over time.",
  },
  {
    id: "p8",
    name: "Aviator Sunglasses",
    brand: "Gucci",
    price: 189,
    rating: 4.8,
    reviews: 67,
    category: "accessories",
    colors: ["#1a1a1a", "#b8860b"],
    sizes: ["One Size"],
    images: [
      u("photo-1622434641406-a158123450f9"),
      u("photo-1572635196237-14b3f281503f"),
    ],
    description: "Iconic aviator frames with gradient lenses and lightweight titanium construction.",
    badge: "NEW",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const trending = () => products.slice(0, 6);
export const flashSale = () => products.filter((p) => p.oldPrice);
export const newArrivals = () => products.filter((p) => p.badge === "NEW");
