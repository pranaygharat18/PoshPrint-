// POSHPRINT Luxury Apparel & Footwear — Canonical Product Catalog
// Sections: Casual, Professional, Kids, Shoes & Footwear

export const PRODUCTS = [
  // ==================== CASUAL WEAR ====================
  {
    id: "pp-c01",
    title: "Terracotta Minimalist Heavyweight Graphic Tee",
    subtitle: "Casual Collection • Everyday Luxury",
    style: "casual",
    category: "t-shirts",
    gender: "unisex",
    price: 65,
    comparePrice: 85,
    rating: 4.9,
    reviewCount: 42,
    isNew: true,
    isLimited: false,
    fit: "Oversized Boxy Fit",
    fabric: "100% GOTS Organic Cotton • 280gsm Heavy Jersey",
    care: "Machine wash cold inside out • Hang dry in shade",
    colors: [
      { name: "Onyx Black", hex: "#141414" },
      { name: "Chalk Ecru", hex: "#F4F0E8" },
      { name: "Vintage Sage", hex: "#616A59" }
    ],
    sizes: [
      { size: "XS", stock: 6 },
      { size: "S", stock: 12 },
      { size: "M", stock: 18 },
      { size: "L", stock: 14 },
      { size: "XL", stock: 8 },
      { size: "XXL", stock: 3 }
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Our signature casual heavyweight t-shirt cut in a modern boxy silhouette with dropped shoulders and a reinforced collar that retains its crisp shape wash after wash."
  },
  {
    id: "pp-c02",
    title: "Obsidian French Terry Sculpted Hoodie",
    subtitle: "Casual Collection • Streetwear Drop",
    style: "casual",
    category: "hoodies",
    gender: "unisex",
    price: 135,
    comparePrice: 165,
    rating: 5.0,
    reviewCount: 68,
    isNew: true,
    isLimited: true,
    fit: "Relaxed Sculpted Drape",
    fabric: "460gsm Heavy French Terry Cotton • Zero Synthetic Blends",
    care: "Gentle cold cycle • Dry flat",
    colors: [
      { name: "Obsidian Black", hex: "#161616" },
      { name: "Oatmeal Heather", hex: "#D9D4C7" },
      { name: "Forest Moss", hex: "#353F33" }
    ],
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 15 },
      { size: "L", stock: 9 },
      { size: "XL", stock: 4 }
    ],
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "460gsm heavy cotton French Terry hoodie. Sculpted double-layered hood without drawstrings for a clean architectural neckline and subtle tonal chest embroidery."
  },
  {
    id: "pp-c03",
    title: "Relaxed Linen Camp Collar Summer Shirt",
    subtitle: "Casual Collection • Resort Series",
    style: "casual",
    category: "shirts",
    gender: "men",
    price: 95,
    comparePrice: 120,
    rating: 4.8,
    reviewCount: 31,
    isNew: false,
    isLimited: false,
    fit: "Breezy Relaxed Cut",
    fabric: "100% French Normandy Flax Linen • 185gsm Air-Washed",
    care: "Machine wash cold delicate • Natural texture celebrated",
    colors: [
      { name: "Sand Dune", hex: "#D6C7AC" },
      { name: "Terracotta Rust", hex: "#B85C38" }
    ],
    sizes: [
      { size: "S", stock: 4 },
      { size: "M", stock: 11 },
      { size: "L", stock: 14 },
      { size: "XL", stock: 6 }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Featherweight French linen camp shirt featuring an open spread collar and natural mother-of-pearl buttons. Cool and breathable for weekend leisure and warm evenings."
  },

  // ==================== PROFESSIONAL / FORMAL ====================
  {
    id: "pp-p01",
    title: "Verona Tailored Italian Wool Double-Breasted Blazer",
    subtitle: "Professional Collection • Sartorial Tailoring",
    style: "professional",
    category: "blazers",
    gender: "men",
    price: 280,
    comparePrice: 340,
    rating: 5.0,
    reviewCount: 29,
    isNew: true,
    isLimited: false,
    fit: "Modern Structured Tailoring",
    fabric: "100% Super 130s Merino Wool • Cupro Silk Lining",
    care: "Specialist dry clean only",
    colors: [
      { name: "Midnight Navy", hex: "#182133" },
      { name: "Charcoal Slate", hex: "#2E3033" }
    ],
    sizes: [
      { size: "38R", stock: 3 },
      { size: "40R", stock: 8 },
      { size: "42R", stock: 10 },
      { size: "44R", stock: 4 }
    ],
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Double-breasted blazer woven in Biella, Italy. Cut with clean peak lapels, half-canvas inner construction for natural chest drape, and real horn buttons."
  },
  {
    id: "pp-p02",
    title: "Atelier Silk Blend Tailored Trench Coat",
    subtitle: "Professional Collection • Executive Outerwear",
    style: "professional",
    category: "outerwear",
    gender: "women",
    price: 320,
    comparePrice: 390,
    rating: 4.9,
    reviewCount: 37,
    isNew: true,
    isLimited: true,
    fit: "Fluid Elegant Silhouette with Belt",
    fabric: "70% Organic Cotton • 30% Mulberry Silk Twill • Water-Repellent",
    care: "Dry clean only",
    colors: [
      { name: "Classic Camel", hex: "#C19A6B" },
      { name: "Onyx Black", hex: "#161616" }
    ],
    sizes: [
      { size: "XS", stock: 2 },
      { size: "S", stock: 7 },
      { size: "M", stock: 9 },
      { size: "L", stock: 4 }
    ],
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "An iconic luxury trench coat engineered with a structured double storm flap, horn buckles, and a silk twill interior for the modern executive boardroom."
  },
  {
    id: "pp-p03",
    title: "Egyptian Giza Cotton Crisp Executive Shirt",
    subtitle: "Professional Collection • Formal Shirting",
    style: "professional",
    category: "shirts",
    gender: "men",
    price: 110,
    comparePrice: 140,
    rating: 4.8,
    reviewCount: 45,
    isNew: false,
    isLimited: false,
    fit: "Contemporary Tailored Fit",
    fabric: "120/2 Two-Ply Giza Extra-Long Staple Cotton",
    care: "Warm iron with steam • Machine wash gentle",
    colors: [
      { name: "Crisp Optical White", hex: "#FAF9F6" },
      { name: "Sky French Blue", hex: "#D0E0EC" }
    ],
    sizes: [
      { size: "15.0", stock: 5 },
      { size: "15.5", stock: 12 },
      { size: "16.0", stock: 14 },
      { size: "16.5", stock: 8 },
      { size: "17.0", stock: 3 }
    ],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Woven with rare Egyptian Giza extra-long staple yarns for a silky sheen and exceptional wrinkle resistance. Semi-spread collar suitable for ties or worn open."
  },
  {
    id: "pp-p04",
    title: "Milan Pleated Wide-Leg Wool Trousers",
    subtitle: "Professional Collection • Tailored Separates",
    style: "professional",
    category: "trousers",
    gender: "women",
    price: 160,
    comparePrice: 195,
    rating: 4.9,
    reviewCount: 22,
    isNew: true,
    isLimited: false,
    fit: "High-Waisted Fluid Wide-Leg",
    fabric: "100% Lightweight Virgin Wool Flannel",
    care: "Dry clean only",
    colors: [
      { name: "Heather Slate", hex: "#63666A" },
      { name: "Ivory Cream", hex: "#ECE6D8" }
    ],
    sizes: [
      { size: "US 2", stock: 3 },
      { size: "US 4", stock: 8 },
      { size: "US 6", stock: 10 },
      { size: "US 8", stock: 6 },
      { size: "US 10", stock: 2 }
    ],
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "High-waist trousers with double front pleats and side adjusters, falling into a statuesque wide-leg hem with tailored cuffs."
  },

  // ==================== KIDS COLLECTION ====================
  {
    id: "pp-k01",
    title: "Little Atelier Organic Printed Mini Tee",
    subtitle: "Kids Collection • Pure Organic Play",
    style: "kids",
    category: "t-shirts",
    gender: "kids",
    price: 35,
    comparePrice: 45,
    rating: 4.9,
    reviewCount: 34,
    isNew: true,
    isLimited: false,
    fit: "Comfortable Kid Relaxed Cut",
    fabric: "100% GOTS Certified Organic Combed Cotton • Hypoallergenic",
    care: "Machine wash cold gentle • Kid safe non-toxic dyes",
    colors: [
      { name: "Pastel Buttercup", hex: "#F3E5AB" },
      { name: "Soft Sky Blue", hex: "#BDD4E7" },
      { name: "Chalk White", hex: "#F7F5EE" }
    ],
    sizes: [
      { size: "3-4Y", stock: 8 },
      { size: "5-6Y", stock: 14 },
      { size: "7-8Y", stock: 12 },
      { size: "9-10Y", stock: 10 },
      { size: "11-12Y", stock: 6 }
    ],
    images: [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Crafted exclusively from ultra-soft certified organic cotton with itch-free flatlock seams and gentle water-based screenprint graphics safe for delicate sensitive skin."
  },
  {
    id: "pp-k02",
    title: "Cozy Mini French Terry Kangaroo Hoodie",
    subtitle: "Kids Collection • Everyday Warmth",
    style: "kids",
    category: "hoodies",
    gender: "kids",
    price: 55,
    comparePrice: 70,
    rating: 5.0,
    reviewCount: 27,
    isNew: true,
    isLimited: false,
    fit: "Cozy Boxy Fit",
    fabric: "340gsm Brushed Organic Fleece • Anti-Pilling",
    care: "Machine wash cold inside out • Tumble dry low",
    colors: [
      { name: "Teddy Sand", hex: "#CDB599" },
      { name: "Charcoal Grey", hex: "#3D3E42" }
    ],
    sizes: [
      { size: "4Y", stock: 6 },
      { size: "6Y", stock: 10 },
      { size: "8Y", stock: 9 },
      { size: "10Y", stock: 7 },
      { size: "12Y", stock: 4 }
    ],
    images: [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Plush, cloud-soft brushed fleece pullover hoodie with roomy front kangaroo pocket and reinforced stretchy ribbed cuffs designed for active adventures."
  },
  {
    id: "pp-k03",
    title: "Junior French Terry Matching Sweatset",
    subtitle: "Kids Collection • Two-Piece Set",
    style: "kids",
    category: "sets",
    gender: "kids",
    price: 75,
    comparePrice: 95,
    rating: 4.8,
    reviewCount: 19,
    isNew: false,
    isLimited: true,
    fit: "Two-Piece Set (Crewneck + Sweatpants)",
    fabric: "100% Organic Loopback Cotton with Elastic Waistband",
    care: "Machine wash cold • Colorfast guarantee",
    colors: [
      { name: "Pistachio Sage", hex: "#9CAF88" },
      { name: "Warm Biscuit", hex: "#D2B48C" }
    ],
    sizes: [
      { size: "4Y", stock: 4 },
      { size: "6Y", stock: 8 },
      { size: "8Y", stock: 11 },
      { size: "10Y", stock: 5 }
    ],
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Matching minimalist crewneck and jogger sweatpants. Featuring an adjustable soft cotton drawstring and deep side pockets."
  },

  // ==================== SHOES & FOOTWEAR ====================
  {
    id: "pp-s01",
    title: "Atelier Modena Handcrafted Italian Calfskin Loafers",
    subtitle: "Footwear Collection • Tuscan Hand-Stitched",
    style: "shoes",
    category: "shoes",
    gender: "men",
    price: 240,
    comparePrice: 295,
    rating: 5.0,
    reviewCount: 38,
    isNew: true,
    isLimited: true,
    fit: "True to Size • Handcrafted Blake Stitch",
    fabric: "Full-Grain Italian Calfskin Leather • Hand-Burnished",
    care: "Condition with neutral beeswax cream • Use cedar shoe trees",
    colors: [
      { name: "Espresso Brown", hex: "#2C1B18" },
      { name: "Obsidian Black", hex: "#111111" }
    ],
    sizes: [
      { size: "US 8 / EU 41", stock: 3 },
      { size: "US 9 / EU 42", stock: 7 },
      { size: "US 10 / EU 43", stock: 8 },
      { size: "US 11 / EU 44", stock: 4 },
      { size: "US 12 / EU 45", stock: 2 }
    ],
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Artisan penny loafers handcrafted in Tuscany using full-grain calfskin leather with hand-painted bevelled edges. Blake-stitched leather outsole with stacked heel."
  },
  {
    id: "pp-s02",
    title: "Monochrome Sculpted Minimalist Leather Sneaker",
    subtitle: "Footwear Collection • Everyday Essential",
    style: "shoes",
    category: "shoes",
    gender: "unisex",
    price: 155,
    comparePrice: 190,
    rating: 4.9,
    reviewCount: 56,
    isNew: true,
    isLimited: false,
    fit: "True to Size • Memory Foam Cushion Insole",
    fabric: "Nappa Calf Leather Upper • Natural Margom Rubber Sole",
    care: "Wipe with soft damp cloth • Leather balm",
    colors: [
      { name: "Chalk White", hex: "#FAF8F5" },
      { name: "Triple Black", hex: "#141414" }
    ],
    sizes: [
      { size: "US 7 / EU 40", stock: 5 },
      { size: "US 8 / EU 41", stock: 9 },
      { size: "US 9 / EU 42", stock: 14 },
      { size: "US 10 / EU 43", stock: 11 },
      { size: "US 11 / EU 44", stock: 6 }
    ],
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Architectural low-top sneaker crafted from supple Italian Nappa leather with waxed cotton laces and custom vulcanized rubber cupsole engineered for all-day comfort."
  },
  {
    id: "pp-s03",
    title: "Verona Suede Chelsea Boot with Crepe Sole",
    subtitle: "Footwear Collection • Heritage Silhouette",
    style: "shoes",
    category: "shoes",
    gender: "men",
    price: 210,
    comparePrice: 260,
    rating: 4.8,
    reviewCount: 25,
    isNew: false,
    isLimited: false,
    fit: "Snug Ankle Drape with Pull Tab",
    fabric: "Premium Velour Calf Suede • Natural Plantation Crepe Sole",
    care: "Spray with suede water-repellent protector • Suede brush",
    colors: [
      { name: "Desert Sand Suede", hex: "#C2A684" },
      { name: "Anthracite Charcoal", hex: "#373737" }
    ],
    sizes: [
      { size: "US 8 / EU 41", stock: 4 },
      { size: "US 9 / EU 42", stock: 8 },
      { size: "US 10 / EU 43", stock: 7 },
      { size: "US 11 / EU 44", stock: 3 }
    ],
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Classic Chelsea boots cut from buttery velour suede with dual elastic side gussets, woven pull loops, and a shock-absorbing natural crepe rubber sole."
  },
  {
    id: "pp-s04",
    title: "Atelier Pointed Toe Stiletto Kitten Heel",
    subtitle: "Footwear Collection • Evening Elegance",
    style: "shoes",
    category: "shoes",
    gender: "women",
    price: 190,
    comparePrice: 235,
    rating: 5.0,
    reviewCount: 19,
    isNew: true,
    isLimited: true,
    fit: "55mm Architectural Heel • Cushioned Arch Support",
    fabric: "Polished Patent Leather Upper • Leather Lining and Sole",
    care: "Buff with patent leather shine cloth",
    colors: [
      { name: "Noir Gloss", hex: "#111111" },
      { name: "Nude Blush", hex: "#E8C8B5" }
    ],
    sizes: [
      { size: "US 6 / EU 36", stock: 3 },
      { size: "US 7 / EU 37", stock: 7 },
      { size: "US 8 / EU 38", stock: 8 },
      { size: "US 9 / EU 39", stock: 4 }
    ],
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Sleek pointed-toe slingback heels featuring a 55mm sculpted kitten heel, ergonomic arch cushioning, and polished Italian patent leather."
  }
];

export const STYLES = [
  { id: "all", name: "All Collections", icon: "ph-squares-four" },
  { id: "casual", name: "Casual Everyday", icon: "ph-t-shirt" },
  { id: "professional", name: "Professional & Formal", icon: "ph-suit" },
  { id: "kids", name: "Kids Collection", icon: "ph-baby" },
  { id: "shoes", name: "Shoes & Footwear", icon: "ph-sneaker" }
];

export const SIZE_CHART = {
  metric: [
    { size: "XS", chest: "96 cm", length: "68 cm", shoulder: "48 cm", sleeve: "21 cm" },
    { size: "S", chest: "102 cm", length: "70 cm", shoulder: "50 cm", sleeve: "22 cm" },
    { size: "M", chest: "108 cm", length: "73 cm", shoulder: "52 cm", sleeve: "23 cm" },
    { size: "L", chest: "114 cm", length: "76 cm", shoulder: "54 cm", sleeve: "24 cm" },
    { size: "XL", chest: "120 cm", length: "78 cm", shoulder: "56 cm", sleeve: "25 cm" },
    { size: "XXL", chest: "126 cm", length: "80 cm", shoulder: "58 cm", sleeve: "26 cm" }
  ],
  imperial: [
    { size: "XS", chest: '37.8"', length: '26.8"', shoulder: '18.9"', sleeve: '8.3"' },
    { size: "S", chest: '40.2"', length: '27.6"', shoulder: '19.7"', sleeve: '8.7"' },
    { size: "M", chest: '42.5"', length: '28.7"', shoulder: '20.5"', sleeve: '9.1"' },
    { size: "L", chest: '44.9"', length: '29.9"', shoulder: '21.3"', sleeve: '9.4"' },
    { size: "XL", chest: '47.2"', length: '30.7"', shoulder: '22.0"', sleeve: '9.8"' },
    { size: "XXL", chest: '49.6"', length: '31.5"', shoulder: '22.8"', sleeve: '10.2"' }
  ]
};

export const CUSTOM_PRESETS = [
  {
    id: "tee",
    name: "Heavyweight Boxy T-Shirt (280gsm)",
    basePrice: 65,
    colors: [
      { name: "Onyx Black", hex: "#121212" },
      { name: "Chalk Off-White", hex: "#F3EFE6" },
      { name: "Washed Vintage Olive", hex: "#464A3E" },
      { name: "Earth Sand", hex: "#D6C7AC" }
    ]
  },
  {
    id: "hoodie",
    name: "French Terry Sculpted Hoodie (460gsm)",
    basePrice: 135,
    colors: [
      { name: "Onyx Black", hex: "#121212" },
      { name: "Mineral Taupe", hex: "#8F8B83" },
      { name: "Deep Bone", hex: "#EBE6DA" }
    ]
  },
  {
    id: "kids-tee",
    name: "Kids Organic Mini Crewneck (220gsm)",
    basePrice: 35,
    colors: [
      { name: "Soft Butter", hex: "#F5E6BA" },
      { name: "Pastel Sky", hex: "#B8D4E3" },
      { name: "Chalk White", hex: "#FAF8F5" }
    ]
  }
];
