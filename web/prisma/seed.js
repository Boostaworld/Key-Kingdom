// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const featuredOrder = ["lynx-executor", "assembly-executor", "quantum-injector"];

const products = [
  {
    id: "assembly-executor",
    name: "Assembly",
    slug: "assembly-executor",
    category: "Executors",
    iconUrl: "/products/assembly.png",
    heroImageUrl: "/products/assembly-hero.png",
    tagline: "Lightweight Roblox executor with fast injection.",
    description:
      "Assembly is a fast, reliable executor for Roblox scripts with instant injection, auto-attach, and custom UI themes.",
    features: [
      "Instant script injection",
      "Auto-attach on game launch",
      "Custom UI themes",
      "Regular updates",
    ],
    vendorLinks: [
      {
        id: "assembly-keyvendor",
        vendorName: "KeyVendor",
        url: "https://keyvendor.com/assembly",
        redirectUrl: "https://keyvendor.com/assembly?aff=XXXX",
        ctaLabel: "Buy via KeyVendor",
        price: 9.97,
        currency: "USD",
        paymentMethods: ["credit_card", "paypal"],
        notes: "Instant delivery via email",
        avatarUrl: "/vendors/keyvendor.png",
      },
      {
        id: "assembly-scripthub",
        vendorName: "ScriptHub",
        url: "https://scripthub.io/assembly",
        redirectUrl: "https://scripthub.io/assembly?ref=YYYY",
        price: 11.99,
        currency: "USD",
        paymentMethods: ["credit_card", "crypto"],
        notes: "24/7 support",
        avatarUrl: "/vendors/scripthub.png",
      },
    ],
    tags: ["executor", "roblox"],
    isUpdated: true,
    lastUpdated: "2025-11-15",
  },
  {
    id: "lynx-executor",
    name: "Lynx Executor",
    slug: "lynx-executor",
    category: "Executors",
    iconUrl: "/products/lynx.png",
    tagline: "Stable execution with script sandboxing and crash recovery.",
    description:
      "Lynx prioritizes stability with sandboxed execution, crash recovery, and a built-in script vault so you can swap between loadouts instantly.",
    features: [
      "Sandboxed script runner",
      "One-click crash recovery",
      "Script vault with tagging",
      "Profile-based settings",
    ],
    vendorLinks: [
      {
        id: "lynx-direct",
        vendorName: "Lynx Store",
        url: "https://lynx.gg/buy",
        redirectUrl: "https://lynx.gg/buy?aff=keykingdom",
        ctaLabel: "Buy direct",
        price: 14.99,
        currency: "USD",
        paymentMethods: ["credit_card", "paypal", "crypto"],
        notes: "Official checkout with auto-updates",
      },
      {
        id: "lynx-keyhub",
        vendorName: "KeyHub",
        url: "https://keyhub.to/lynx",
        price: 12.99,
        currency: "USD",
        paymentMethods: ["credit_card"],
        notes: "Starter keys delivered instantly",
      },
    ],
    tags: ["executor", "recovery", "vault"],
    isUpdated: true,
    lastUpdated: "2025-10-02",
  },
  {
    id: "quantum-executor",
    name: "Quantum Injector",
    slug: "quantum-injector",
    category: "Executors",
    iconUrl: "/products/quantum.png",
    heroImageUrl: "/products/quantum-hero.png",
    tagline: "Performance-focused executor with script scheduling.",
    description:
      "Quantum Injector optimizes throughput with multi-threaded execution, scheduled script runs, and detailed analytics so you can benchmark every build.",
    features: [
      "Multi-threaded execution",
      "Script scheduling and queues",
      "Runtime performance analytics",
      "Session restore on reconnect",
    ],
    vendorLinks: [
      {
        id: "quantum-studio",
        vendorName: "Quantum Studio",
        url: "https://quantum.run/store",
        redirectUrl: "https://quantum.run/store?ref=kk",
        price: 19.99,
        currency: "USD",
        paymentMethods: ["credit_card", "paypal", "crypto"],
        notes: "Includes analytics dashboard",
      },
      {
        id: "quantum-altshop",
        vendorName: "AltShop",
        url: "https://altshop.gg/quantum",
        price: 17.5,
        currency: "USD",
        paymentMethods: ["crypto", "other"],
        notes: "Crypto-friendly checkout",
        avatarUrl: "/vendors/altshop.png",
      },
    ],
    tags: ["executor", "performance", "analytics"],
    isUpdated: false,
    lastUpdated: "2025-09-12",
  },
];

async function seed() {
  for (const product of products) {
    const sortOrder = featuredOrder.indexOf(product.slug);
    await prisma.vendorLink.deleteMany({ where: { productId: product.id } });

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.slug,
        category: product.category,
        iconUrl: product.iconUrl,
        heroImageUrl: product.heroImageUrl,
        tagline: product.tagline,
        description: product.description,
        features: JSON.stringify(product.features),
        sortOrder: sortOrder === -1 ? null : sortOrder,
        isUpdated: product.isUpdated,
        tags: JSON.stringify(product.tags),
        lastUpdated: product.lastUpdated,
        vendorLinks: {
          create: product.vendorLinks.map((link) => ({
            ...link,
            paymentMethods: JSON.stringify(link.paymentMethods),
          })),
        },
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        iconUrl: product.iconUrl,
        heroImageUrl: product.heroImageUrl,
        tagline: product.tagline,
        description: product.description,
        features: JSON.stringify(product.features),
        sortOrder: sortOrder === -1 ? null : sortOrder,
        isUpdated: product.isUpdated,
        tags: JSON.stringify(product.tags),
        lastUpdated: product.lastUpdated,
        vendorLinks: {
          create: product.vendorLinks.map((link) => ({
            ...link,
            paymentMethods: JSON.stringify(link.paymentMethods),
          })),
        },
      },
    });
  }
}

seed()
  .then(() => {
    console.log("Seed data applied");
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
