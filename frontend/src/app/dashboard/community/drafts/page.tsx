"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Trash2, Heart } from "lucide-react";

// Mock user data
const mockUser = {
  name: "Avital",
};

// Mock drafts data (from Figma)
const mockDrafts = [
  {
    id: 1,
    artistId: 1,
    artistName: "TUNA",
    artistImage: "/artists/tuna.jpg",
    category: "MUSIC",
    date: "07/01/25",
    location: "USA, New York City",
    status: "Draft, Community Request",
    lastEdit: "07/01/25",
  },
  {
    id: 2,
    artistId: 2,
    artistName: "EMILY DAMARY",
    artistImage: "/artists/emily-damary.jpg",
    category: "LECTURE",
    date: "15/01/25",
    location: "USA, Los Angeles",
    status: "Draft",
    lastEdit: "10/01/25",
  },
];

function DraftCard({ draft, onDelete }: { draft: typeof mockDrafts[0]; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex">
      {/* Artist Image */}
      <div className="relative w-48 h-44 flex-shrink-0 bg-gradient-to-br from-pink-100 via-pink-50 to-teal-50">
        {draft.artistImage && !draft.artistImage.includes("placeholder") ? (
          <Image
            src={draft.artistImage}
            alt={draft.artistName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-serif font-bold text-pink-300/60">
              {draft.artistName.charAt(0)}
            </span>
          </div>
        )}
        {/* Heart icon */}
        <button className="absolute top-3 right-3 text-pink-400">
          <Heart size={20} />
        </button>
        {/* Date overlay */}
        <div className="absolute bottom-3 left-3 text-white text-xs">
          <p className="font-semibold">{draft.date}</p>
          <p>Location:</p>
          <p>{draft.location}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex justify-between">
        <div>
          {/* Artist Name & Category */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-slate-900">{draft.artistName}</h3>
            <span className="px-3 py-1 border border-slate-300 rounded-full text-xs font-medium">
              {draft.category}
            </span>
          </div>

          {/* Status */}
          <p className="text-sm mb-1">
            <span className="text-slate-500">Status: </span>
            <span className="text-pink-500 font-medium">{draft.status}</span>
          </p>

          {/* Last Edit */}
          <p className="text-sm text-slate-500">
            <span>Last Edit: </span>
            <span>{draft.lastEdit}</span>
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(draft.id)}
          className="self-start p-2 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState(mockDrafts);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      setDrafts(drafts.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-full px-8 py-4 shadow-lg flex items-center gap-12">
              <Link
                href="/search"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                <Search size={18} />
                <span className="uppercase tracking-wide text-sm">Search</span>
              </Link>

              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-wider text-slate-900">
                  KOLAMBA
                </span>
              </Link>

              <Link
                href="/dashboard/community"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                <User size={18} />
                <span className="uppercase tracking-wide text-sm">{mockUser.name}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="text-sm">
              <Link href="/dashboard/community" className="text-slate-500 hover:text-slate-700">
                Profile
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-900 font-medium underline">Drafts</span>
            </nav>
          </div>

          {/* Page Title */}
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900">
              DRAFTS
            </h1>
            <span className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
              {drafts.length}
            </span>
          </div>

          {/* Drafts List */}
          {drafts.length > 0 ? (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <DraftCard key={draft.id} draft={draft} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <p className="text-slate-500 text-lg">No drafts yet.</p>
              <Link
                href="/artists"
                className="inline-block mt-4 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
              >
                Browse Artists
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
