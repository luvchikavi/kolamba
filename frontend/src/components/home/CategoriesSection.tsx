"use client";

import { useState } from "react";
import Link from "next/link";

const categoriesRow1 = [
  { slug: "music", image: "/design/cat-music.png", hoverImage: "/design/cat-music-hover.png", alt: "Music" },
  { slug: "literature", image: "/design/cat-literature.png", hoverImage: "/design/cat-literature-hover.png", alt: "Literature" },
  { slug: "journalism", image: "/design/cat-journalism.png", hoverImage: "/design/cat-journalism-hover.png", alt: "Journalism" },
];

const categoriesRow2 = [
  { slug: "judaism", image: "/design/cat-judaism.png", hoverImage: "/design/cat-judaism-hover.png", alt: "Judaism" },
  { slug: "comedy", image: "/design/cat-comedy.png", hoverImage: "/design/cat-comedy-hover.png", alt: "Comedy" },
  { slug: "inspiration", image: "/design/cat-inspiration.png", hoverImage: "/design/cat-inspiration-hover.png", alt: "Inspiration" },
];

function CategoryButton({ cat }: { cat: { slug: string; image: string; hoverImage: string; alt: string } }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/search?category=${cat.slug}`}
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cat.image}
        alt={cat.alt}
        className={`h-14 md:h-16 w-auto transition-opacity duration-200 ${hovered ? "opacity-0" : "opacity-100"}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cat.hoverImage}
        alt={cat.alt}
        className={`absolute inset-0 h-14 md:h-16 w-auto transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}
      />
    </Link>
  );
}

export default function CategoriesSection() {
  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5 mb-4 md:mb-5">
          {categoriesRow1.map((cat) => (
            <CategoryButton key={cat.slug} cat={cat} />
          ))}
        </div>
        {/* Row 2 */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
          {categoriesRow2.map((cat) => (
            <CategoryButton key={cat.slug} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
