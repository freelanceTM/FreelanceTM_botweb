import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { categories } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // Seed categories
  const categoryData = [
    {
      nameRu: "Дизайн",
      nameTm: "Dizaýn",
      slug: "design",
      sortOrder: 1,
    },
    {
      nameRu: "Разработка",
      nameTm: "Programma",
      slug: "development",
      sortOrder: 2,
    },
    {
      nameRu: "Маркетинг",
      nameTm: "Marketing",
      slug: "marketing",
      sortOrder: 3,
    },
    {
      nameRu: "Тексты",
      nameTm: "Tekstler",
      slug: "writing",
      sortOrder: 4,
    },
    {
      nameRu: "Видео",
      nameTm: "Wideo",
      slug: "video",
      sortOrder: 5,
    },
    {
      nameRu: "Аудио",
      nameTm: "Audio",
      slug: "audio",
      sortOrder: 6,
    },
    {
      nameRu: "SEO",
      nameTm: "SEO",
      slug: "seo",
      sortOrder: 7,
    },
    {
      nameRu: "SMM",
      nameTm: "SMM",
      slug: "smm",
      sortOrder: 8,
    },
    {
      nameRu: "Бизнес",
      nameTm: "Biznes",
      slug: "business",
      sortOrder: 9,
    },
    {
      nameRu: "Личные услуги",
      nameTm: "Şahsy hyzmatlar",
      slug: "personal",
      sortOrder: 10,
    },
  ];

  for (const cat of categoryData) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoNothing();
  }

  console.log("✓ Categories seeded");
  console.log("Database seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
