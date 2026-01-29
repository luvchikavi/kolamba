"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, ChevronDown, X, Search } from "lucide-react";
import { API_URL } from "@/lib/api";

// The 10 official categories matching the database
const categories = [
  "Music",
  "Dance",
  "Comedy",
  "Theater",
  "Visual Arts",
  "Literature",
  "Film",
  "Television",
  "Religion",
  "Culinary",
];

const subcategories: Record<string, string[]> = {
  Music: [
    "Pop",
    "Rock",
    "Jazz",
    "Classical",
    "Mediterranean",
    "Mizrahi",
    "Hip Hop / Rap",
    "Electronic",
    "Folk",
    "World Music",
    "Piyyut / Liturgical",
    "Cantorial",
    "A Cappella",
    "Children's Music",
  ],
  Dance: [
    "Israeli Folk Dance",
    "Contemporary",
    "Ballet",
    "Hip Hop",
    "Ballroom",
    "Modern",
    "Choreography",
    "Dance Instruction",
  ],
  Comedy: [
    "Stand-up",
    "Improv",
    "Sketch",
    "Musical Comedy",
    "Satire",
    "Physical Comedy",
    "Family-Friendly",
  ],
  Theater: [
    "Acting",
    "Directing",
    "Playwriting",
    "Musical Theater",
    "Drama",
    "Children's Theater",
    "Puppetry",
    "Storytelling",
  ],
  "Visual Arts": [
    "Painting",
    "Sculpture",
    "Photography",
    "Digital Art",
    "Installation Art",
    "Art Workshops",
    "Judaica Art",
    "Calligraphy",
  ],
  Literature: [
    "Poetry",
    "Fiction",
    "Non-Fiction",
    "Screenwriting",
    "Children's Literature",
    "Storytelling",
    "Spoken Word",
    "Journalism",
  ],
  Film: [
    "Director",
    "Screenwriter",
    "Documentary",
    "Actor",
    "Producer",
    "Film Critic",
    "Animation",
    "Short Films",
  ],
  Television: [
    "TV Host",
    "News Anchor",
    "Talk Show",
    "Documentary Series",
    "Reality TV",
    "Drama Series",
    "Comedy Series",
  ],
  Religion: [
    "Rabbi",
    "Cantor",
    "Torah Scholar",
    "Interfaith Speaker",
    "Religious Education",
    "Spiritual Guidance",
    "Jewish History",
    "Holocaust Education",
  ],
  Culinary: [
    "Chef",
    "Food Writer",
    "Cooking Demonstrations",
    "Food Historian",
    "Kosher Cuisine",
    "Mediterranean Cooking",
    "Baking / Pastry",
  ],
};

const languages = [
  "English",
  "Hebrew",
  "French",
  "Spanish",
  "Russian",
  "German",
  "Italian",
  "Amharic",
  "Dutch",
  "Swedish",
  "Yiddish",
];

const countryCodes = [
  { code: "+972", label: "Israel (+972)" },
  { code: "+1", label: "US/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+33", label: "France (+33)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+251", label: "Ethiopia (+251)" },
];

const performanceTypes = [
  "Solo Performance",
  "Band/Group",
  "Workshop Leader",
  "Lecturer/Speaker",
  "Interactive Show",
  "Children's Entertainment",
];

export default function ArtistRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [submittedArtistsCount, setSubmittedArtistsCount] = useState(0);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initialFormData = {
    artistName: "",
    realName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+972",
    category: "",
    subcategories: [] as string[],
    otherCategories: [] as string[],
    bio: "",
    location: "",
    languages: ["English"],
    performanceTypes: [] as string[],
    priceRangeMin: "",
    priceRangeMax: "",
    website: "",
    instagram: "",
    youtube: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    acceptTerms: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  // Store agent contact info to preserve when adding more artists
  const [agentContactInfo, setAgentContactInfo] = useState({
    realName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+972",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddCategory = (cat: string) => {
    if (!formData.otherCategories.includes(cat) && cat !== formData.category) {
      setFormData({ ...formData, otherCategories: [...formData.otherCategories, cat] });
    }
    setCategorySearch("");
    setShowCategoryDropdown(false);
  };

  const handleRemoveCategory = (cat: string) => {
    setFormData({
      ...formData,
      otherCategories: formData.otherCategories.filter((c) => c !== cat),
    });
  };

  const handleTogglePerformanceType = (type: string) => {
    if (formData.performanceTypes.includes(type)) {
      setFormData({
        ...formData,
        performanceTypes: formData.performanceTypes.filter((t) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        performanceTypes: [...formData.performanceTypes, type],
      });
    }
  };

  const handleToggleSubcategory = (subcat: string) => {
    if (formData.subcategories.includes(subcat)) {
      setFormData({
        ...formData,
        subcategories: formData.subcategories.filter((s) => s !== subcat),
      });
    } else {
      setFormData({
        ...formData,
        subcategories: [...formData.subcategories, subcat],
      });
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setFormData({
      ...formData,
      category: newCategory,
      subcategories: [], // Reset subcategories when category changes
    });
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.toLowerCase().includes(categorySearch.toLowerCase()) &&
      cat !== formData.category &&
      !formData.otherCategories.includes(cat)
  );

  // Helper to detect Hebrew characters
  const containsHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);

  // Helper to format number with commas
  const formatNumberWithCommas = (value: string) => {
    const num = value.replace(/,/g, "").replace(/[^0-9]/g, "");
    if (!num) return "";
    return parseInt(num).toLocaleString("en-US");
  };

  // Helper to parse number from formatted string
  const parseFormattedNumber = (value: string) => {
    return value.replace(/,/g, "");
  };

  // Reset form for adding another artist (agent mode)
  const resetFormForNextArtist = () => {
    setFormData({
      ...initialFormData,
      // Preserve agent's contact info
      realName: agentContactInfo.realName,
      email: agentContactInfo.email,
      phone: agentContactInfo.phone,
      phoneCountryCode: agentContactInfo.phoneCountryCode,
    });
    setCategorySearch("");
    setIsSubmitted(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.artistName || formData.artistName.length < 2) {
      newErrors.artistName = "Artist/Stage name is required";
    } else if (containsHebrew(formData.artistName)) {
      newErrors.artistName = "Please use English characters only";
    }
    if (!formData.realName || formData.realName.length < 2) {
      newErrors.realName = "Full name is required";
    } else if (containsHebrew(formData.realName)) {
      newErrors.realName = "Please use English characters only";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.category) {
      newErrors.category = "Primary category is required";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms of Service";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/register/artist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.realName,
            artist_name: formData.artistName,
            category: formData.category,
            subcategories: formData.subcategories,
            other_categories: formData.otherCategories,
            bio: formData.bio,
            city: formData.location,
            languages: formData.languages,
            performance_types: formData.performanceTypes,
            price_range_min: formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null,
            price_range_max: formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null,
            phone: formData.phone ? `${formData.phoneCountryCode} ${formData.phone}` : null,
            website: formData.website || null,
            instagram: formData.instagram || null,
            youtube: formData.youtube || null,
            facebook: formData.facebook || null,
            twitter: formData.twitter || null,
            linkedin: formData.linkedin || null,
            is_agent_submission: isAgent,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Registration failed");
      }

      // Store agent contact info for subsequent submissions
      if (isAgent && submittedArtistsCount === 0) {
        setAgentContactInfo({
          realName: formData.realName,
          email: formData.email,
          phone: formData.phone,
          phoneCountryCode: formData.phoneCountryCode,
        });
      }

      setSubmittedArtistsCount((prev) => prev + 1);
      setIsSubmitted(true);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-teal-600" size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            {isAgent ? "Artist Submitted!" : "Welcome to Kolamba!"}
          </h1>
          <p className="text-slate-600 mb-2">
            {isAgent
              ? `Artist profile #${submittedArtistsCount} has been created.`
              : "Your artist profile has been created."}
          </p>
          <p className="text-slate-600 mb-6">
            We&apos;ll review the application and get back to you soon.
          </p>
          <div className="flex flex-col gap-3">
            {isAgent && (
              <button
                onClick={resetFormForNextArtist}
                className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-colors"
              >
                Add Another Artist
              </button>
            )}
            <Link
              href="/login"
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-8 mb-12">
          <h1 className="text-2xl font-bold text-slate-900 tracking-wide">KOLAMBA</h1>
          <span className="text-xl text-slate-600">ARTIST SIGN UP</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Agent Mode Toggle */}
          <div className="mb-8 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgent}
                onChange={(e) => setIsAgent(e.target.checked)}
                className="mt-1 w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-teal-400"
              />
              <div>
                <span className="font-medium text-slate-900">I am an agent representing multiple artists</span>
                <p className="text-sm text-slate-500 mt-1">
                  Check this box if you manage multiple artists and want to submit their profiles. After submitting each artist, you&apos;ll be able to add more.
                </p>
              </div>
            </label>
          </div>

          {submittedArtistsCount > 0 && isAgent && (
            <div className="mb-6 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-teal-700 text-sm font-medium">
                You&apos;ve submitted {submittedArtistsCount} artist{submittedArtistsCount > 1 ? "s" : ""} so far. Continue adding more below.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-8">
            {/* Left Column - Artist Details */}
            <div className="space-y-6">
              {/* Section Header */}
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                1 | Artist Info
              </h2>

              {/* Artist/Stage Name */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Artist / Stage Name
                </label>
                <input
                  type="text"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  placeholder="Your stage name"
                  className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                    errors.artistName
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-teal-400"
                  }`}
                />
                {errors.artistName && (
                  <p className="mt-2 text-sm text-red-500">{errors.artistName}</p>
                )}
              </div>

              {/* Primary Category */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Primary Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none appearance-none bg-white transition-colors ${
                      errors.category
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-300 focus:border-teal-400"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Subcategories - shown when a primary category is selected */}
              {formData.category && subcategories[formData.category] && (
                <div>
                  <label className="block text-base font-medium text-slate-800 mb-2">
                    {formData.category} Subcategories <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subcategories[formData.category].map((subcat) => (
                      <button
                        key={subcat}
                        type="button"
                        onClick={() => handleToggleSubcategory(subcat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.subcategories.includes(subcat)
                            ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                            : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {subcat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Categories */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Additional Categories <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative" ref={categoryDropdownRef}>
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder="Search categories..."
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  {showCategoryDropdown && filteredCategories.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleAddCategory(cat)}
                          className="w-full px-4 py-3 text-left text-base hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.otherCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="hover:text-teal-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Based In
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country/State"
                    className="w-full px-4 py-3.5 pr-12 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <Search
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Short Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself and your work..."
                  rows={4}
                  className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors resize-none"
                />
              </div>

              {/* Performance Types */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Performance Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {performanceTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTogglePerformanceType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.performanceTypes.includes(type)
                          ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              {/* Section Header */}
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                2 | Contact Info
              </h2>

              {/* Full Name */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Full Name (Legal)
                </label>
                <input
                  type="text"
                  value={formData.realName}
                  onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                  placeholder="Israel Israeli"
                  className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                    errors.realName
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-teal-400"
                  }`}
                />
                {errors.realName && (
                  <p className="mt-2 text-sm text-red-500">{errors.realName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="artist@email.com"
                  className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-teal-400"
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={formData.phoneCountryCode}
                      onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                      className="h-full px-3 py-3.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white pr-10 text-teal-600"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none"
                    />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow digits
                      const digits = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: digits });
                    }}
                    placeholder="501234567"
                    maxLength={15}
                    className="flex-1 px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Price Range (USD per show)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.priceRangeMin ? formatNumberWithCommas(formData.priceRangeMin) : ""}
                    onChange={(e) => setFormData({ ...formData, priceRangeMin: parseFormattedNumber(e.target.value) })}
                    placeholder="500"
                    className="w-32 px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <span className="text-slate-600">to</span>
                  <input
                    type="text"
                    value={formData.priceRangeMax ? formatNumberWithCommas(formData.priceRangeMax) : ""}
                    onChange={(e) => setFormData({ ...formData, priceRangeMax: parseFormattedNumber(e.target.value) })}
                    placeholder="2,000"
                    className="w-32 px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <span className="text-slate-600">USD</span>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (formData.languages.includes(lang)) {
                          setFormData({
                            ...formData,
                            languages: formData.languages.filter((l) => l !== lang),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            languages: [...formData.languages, lang],
                          });
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.languages.includes(lang)
                          ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Website / Social Links
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@instagram"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="YouTube channel URL"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="Facebook page URL"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@twitter / X handle"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="LinkedIn profile URL"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="mt-12 flex justify-center">
            <label className="flex items-start gap-3 cursor-pointer max-w-md">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
                className="mt-1 w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-teal-400"
              />
              <span className="text-slate-600 text-sm">
                I accept the{" "}
                <Link href="/terms" className="text-teal-600 hover:text-teal-700 underline" target="_blank">
                  Terms of Service
                </Link>
              </span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm text-center mt-2">{errors.acceptTerms}</p>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex flex-col items-center">
            {errors.submit && (
              <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-16 py-4 bg-slate-900 text-white rounded-full font-semibold text-base hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
