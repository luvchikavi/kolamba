"use client";

import Link from "next/link";

const categoriesRow1 = [
  { slug: "music", image: "/design/cat-music.png", alt: "Music" },
  { slug: "literature", image: "/design/cat-literature.png", alt: "Literature" },
  { slug: "journalism", image: "/design/cat-journalism.png", alt: "Journalism" },
];

const categoriesRow2 = [
  { slug: "judaism", image: "/design/cat-judaism.png", alt: "Judaism" },
  { slug: "comedy", image: "/design/cat-comedy.png", alt: "Comedy" },
  { slug: "inspiration", image: "/design/cat-inspiration.png", alt: "Inspiration" },
];

export default function CategoriesSection() {
  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5 mb-4 md:mb-5">
          {categoriesRow1.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.alt}
                className="h-14 md:h-16 w-auto"
              />
            </Link>
          ))}
        </div>
        {/* Row 2 */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {categoriesRow2.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.alt}
                className="h-14 md:h-16 w-auto"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
