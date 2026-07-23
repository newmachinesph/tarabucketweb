// Seed: one admin editor + sample PH bucket-list articles + demo engagement rows.
// Run: npm run db:seed  (idempotent-ish - clears posts/subscribers/submissions first)
import { db } from './index';
import { users, posts, subscribers, storySubmissions } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import readingTime from 'reading-time';
import slugify from 'slugify';

try {
  process.loadEnvFile('.env');
} catch {
  /* ambient env */
}

const slug = (s: string) => slugify(s, { lower: true, strict: true });
const mins = (body: string) => Math.max(1, Math.ceil(readingTime(body).minutes));

type Seed = {
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  cover: string;
  featured?: boolean;
  body: string;
};

const SEED_POSTS: Seed[] = [
  {
    title: '15 Bucket-List Islands in the Philippines (Beyond Boracay)',
    excerpt:
      'From the pink sands of Sila Island to the lagoons of Culion, here are the islands worth reordering your whole list for.',
    category: 'travel',
    tags: ['islands', 'palawan', 'beaches', 'itinerary'],
    cover: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80',
    featured: true,
    body: `The Philippines has **7,641 islands**, and the internet keeps sending everyone to the same three. This is your permission slip to go wider.

## Why go beyond the usual

The famous spots earn their fame, but the list gets interesting where the ferries get smaller. You trade infinity pools for fishermen who know the tides, and honestly, that is the better souvenir.

## The shortlist

1. **Culion, Palawan** - a former leper colony turned into one of the quietest heritage islands in the country.
2. **Sila Island, Northern Samar** - faint pink sand, almost no crowds.
3. **Balabac, Palawan** - sandbars that disappear at high tide.
4. **Batanes** - not tropical at all; rolling hills, stone houses, and the cleanest air you will breathe.

> Tara na. The list is not going to finish itself.

## Before you book

- Check the **habagat vs amihan** seasons - the wrong month turns paradise into a rain delay.
- Bring cash. Many islands have no ATM.
- Hire local guides. It is safer, and the money stays where it should.

Add three of these to your list this year. Not someday. This year.`,
  },
  {
    title: 'A Kakanin Crawl: Filipino Rice Cakes You Should Eat Before You Die',
    excerpt:
      'Bibingka, puto bumbong, sapin-sapin, kutsinta - a field guide to the sweet, sticky heart of Pinoy merienda.',
    category: 'food',
    tags: ['kakanin', 'merienda', 'dessert', 'heritage'],
    cover: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1600&q=80',
    featured: true,
    body: `Every region has its own rice cake, and every rice cake has an opinion about how it should be eaten. Here is where to start.

## The classics

- **Bibingka** - baked in banana leaf, topped with salted egg and cheese. Christmas in a bite.
- **Puto Bumbong** - purple, steamed in bamboo tubes, brushed with butter and coconut.
- **Sapin-sapin** - layered, chewy, colored by ube and jackfruit.
- **Kutsinta** - humble, jiggly, dressed in grated coconut.

## Where the list gets serious

Head to **Vigan** for *royal bibingka*, **Bohol** for *kalamay* sealed in coconut shells, and any dawn *Simbang Gabi* stall in December.

Tick them off one merienda at a time. Your list should taste like something.`,
  },
  {
    title: 'The Festival Calendar: One Fiesta Worth Chasing Every Month',
    excerpt:
      'Ati-Atihan in January, Sinulog, Panagbenga, MassKara - plan a year around the loudest, most joyful traditions in Asia.',
    category: 'festivals',
    tags: ['fiesta', 'sinulog', 'masskara', 'calendar'],
    cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80',
    body: `You could see a different world-class festival every month without leaving the country. Here is a starter calendar.

## Month by month

- **January** - Ati-Atihan (Kalibo) and Sinulog (Cebu): drums, soot, and devotion.
- **February** - Panagbenga (Baguio): a month of flowers.
- **October** - MassKara (Bacolod): the City of Smiles earns its name.
- **December** - Giant Lantern Festival (San Fernando, Pampanga): light engineering as art.

## How to actually enjoy it

Book beds months ahead, wear shoes you can lose, and hydrate like it is a sport - because it is.

Pick one. Put a date on it. That is how a bucket list becomes a plane ticket.`,
  },
  {
    title: 'Surf, Summit, Freefall: An Adventure Starter List for the Islands',
    excerpt:
      'Learn to surf in Siargao, canyoneer in Cebu, and freedive in Panglao - beginner-friendly ways to earn your stories.',
    category: 'adventure',
    tags: ['surf', 'siargao', 'canyoneering', 'freedive'],
    cover: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1600&q=80',
    featured: true,
    body: `Adventure in the Philippines is unusually beginner-friendly. Warm water, patient guides, and short learning curves.

## Start here

1. **Learn to surf - Siargao.** Cloud 9 gets the headlines; the beach breaks nearby are where you actually learn.
2. **Canyoneer - Kawasan, Cebu.** Jump, swim, and slide down turquoise water.
3. **Freedive - Panglao, Bohol.** One breath, a whole new world.

## Do it right

- Always dive and surf with a certified local guide.
- Respect the ocean. Conditions change fast.
- Leave the reef better than you found it.

Fear is not a reason to skip the list. It is usually the reason the item is on the list.`,
  },
  {
    title: 'Chasing Waterfalls and Rice Terraces the Responsible Way',
    excerpt:
      'The Cordillera terraces and Mindanao’s hidden falls are bucket-list icons - here is how to visit without loving them to death.',
    category: 'nature',
    tags: ['banaue', 'waterfalls', 'sustainability', 'hiking'],
    cover: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=80',
    body: `Some of these places are 2,000 years old. The least we can do is visit gently.

## The icons

- **Banaue & Batad Rice Terraces** - hand-carved into the Cordillera, still farmed today.
- **Tinuy-an Falls, Surigao** - the "little Niagara" of the Philippines.
- **Kabigan Falls, Ilocos Norte** - a cool forest walk to a quiet basin.

## Leave no trace

- Pack out everything, including peels.
- Hire community guides - your fee funds terrace repair and trail upkeep.
- Skip the drone where locals ask you to.

A bucket list should still exist for the next generation. Travel like you mean that.`,
  },
  {
    title: 'Old Towns and Living Crafts: A Heritage Route Across the PH',
    excerpt:
      'Cobblestones in Vigan, weavers in Ilocos, boat-builders in Cebu - culture you can walk through, not just photograph.',
    category: 'culture',
    tags: ['vigan', 'heritage', 'weaving', 'history'],
    cover: 'https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=1600&q=80',
    body: `Heritage travel is the slow lane, and that is the point.

## A loose route

- **Vigan, Ilocos Sur** - a UNESCO-listed Spanish colonial town best seen at 6am, before the tour buses.
- **Paoay & Sarrat** - baroque churches that survived centuries of earthquakes.
- **Abra & Ilocos weavers** - watch *abel* cloth come off the loom, then buy directly.

## Make it count

Talk to the makers. Buy the real thing. Ask about the story before you ask for the price.

The most Filipino bucket list is not a checklist of views. It is a list of people you got to meet.`,
  },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@tarabucket.ph';
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Tara Editor';

  // Never fall back to a hardcoded default password — that would create a
  // publicly-known admin account. Require the operator to set one explicitly.
  if (!password || password.length < 8) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be set (min 8 chars) before seeding the admin user.',
    );
  }

  console.log('Seeding database...');

  // Fresh content each run (keeps the demo clean); users are upserted, not wiped.
  await db.delete(posts);
  await db.delete(subscribers);
  await db.delete(storySubmissions);

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.select().from(users).where(eq(users.email, email));
  let adminId: string;
  if (existing.length > 0) {
    adminId = existing[0].id;
    await db.update(users).set({ passwordHash, name, role: 'admin' }).where(eq(users.id, adminId));
  } else {
    const [row] = await db
      .insert(users)
      .values({ email, name, passwordHash, role: 'admin' })
      .returning({ id: users.id });
    adminId = row.id;
  }
  console.log(`Admin ready: ${email}`);

  let published = new Date('2027-01-05T09:00:00Z').getTime();
  for (const p of SEED_POSTS) {
    await db.insert(posts).values({
      slug: slug(p.title),
      title: p.title,
      excerpt: p.excerpt,
      content: p.body,
      coverImage: p.cover,
      category: p.category,
      tags: p.tags,
      status: 'published',
      featured: p.featured ?? false,
      readingMinutes: mins(p.body),
      authorId: adminId,
      publishedAt: new Date(published),
      updatedAt: new Date(published),
    });
    published += 3 * 24 * 60 * 60 * 1000; // space posts 3 days apart
  }
  console.log(`Inserted ${SEED_POSTS.length} posts.`);

  await db.insert(subscribers).values([
    { email: 'juan@example.com' },
    { email: 'maria@example.com' },
  ]);

  await db.insert(storySubmissions).values({
    name: 'Andrea Lim',
    email: 'andrea@example.com',
    location: 'Siargao',
    title: 'How I finally learned to surf at 30',
    story:
      'I put "learn to surf" on my list five years ago and kept finding excuses. This year I booked a week in Siargao alone...',
    status: 'new',
  });

  console.log('Seed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
