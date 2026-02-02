"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, ChevronDown, X, Search, Upload, Image, Video, Music, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { showError } from "@/lib/toast";

// The 10 official categories as specified by client
const categories = [
  "Music",
  "Literature",
  "Journalism",
  "Film & Television",
  "Religion & Judaism",
  "Comedy",
  "Theater",
  "Visual Arts",
  "Culinary",
  "Inspiration",
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
  Literature: [
    "Poetry",
    "Fiction",
    "Non-Fiction",
    "Children's Literature",
    "Storytelling",
    "Spoken Word",
    "Screenwriting",
  ],
  Journalism: [
    "Print Journalist",
    "Broadcast Journalist",
    "Investigative Reporter",
    "Columnist",
    "War Correspondent",
    "Media Critic",
    "Podcast Host",
  ],
  "Film & Television": [
    "Director",
    "Screenwriter",
    "Documentary",
    "Actor",
    "Producer",
    "Film Critic",
    "Animation",
    "TV Host",
    "News Anchor",
    "Talk Show",
    "Documentary Series",
  ],
  "Religion & Judaism": [
    "Rabbi",
    "Cantor",
    "Torah Scholar",
    "Interfaith Speaker",
    "Religious Education",
    "Spiritual Guidance",
    "Jewish History",
    "Holocaust Education",
    "Jewish Philosophy",
    "Kabbalah",
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
  Culinary: [
    "Chef",
    "Food Writer",
    "Cooking Demonstrations",
    "Food Historian",
    "Kosher Cuisine",
    "Mediterranean Cooking",
    "Baking / Pastry",
  ],
  Inspiration: [
    "Motivational Speaker",
    "Life Coach",
    "Leadership",
    "Entrepreneurship",
    "Personal Development",
    "Wellness",
    "Mindfulness",
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

const countries = [
  "Israel",
  "United States",
  "Canada",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Russia",
  "Argentina",
  "Brazil",
  "Australia",
  "South Africa",
  "Ethiopia",
  "Mexico",
  "Poland",
  "Hungary",
  "Czech Republic",
  "Ukraine",
  "Romania",
  "Greece",
  "Portugal",
  "Ireland",
  "New Zealand",
  "India",
  "Japan",
  "Singapore",
  "Other",
];

export default function ArtistRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [submittedArtistsCount, setSubmittedArtistsCount] = useState(0);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCategoryDropdown &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showCategoryDropdown) {
        setShowCategoryDropdown(false);
      }
    };

    // Use both mousedown and click for better coverage
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showCategoryDropdown]);

  const initialFormData = {
    artistName: "",
    realName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+972",
    category: "",
    subcategories: [] as string[],
    customSubcategory: "",
    otherCategories: [] as string[],
    bio: "",
    country: "Israel",
    languages: ["English"],
    performanceTypes: [] as string[],
    customPerformanceType: "",
    priceRangeMin: "",
    priceRangeMax: "",
    website: "",
    instagram: "",
    youtube: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    // Media fields
    profileImage: "",
    videoUrls: [] as string[],
    portfolioImages: [] as string[],
    spotifyLinks: [] as string[],
    mediaLinks: [] as string[],
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
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

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

  // Phone number validation by country code
  const getPhoneValidation = (countryCode: string): { min: number; max: number } => {
    const validationRules: Record<string, { min: number; max: number }> = {
      "+972": { min: 9, max: 10 },   // Israel
      "+1": { min: 10, max: 10 },    // US/Canada
      "+44": { min: 10, max: 11 },   // UK
      "+33": { min: 9, max: 9 },     // France
      "+49": { min: 10, max: 11 },   // Germany
      "+34": { min: 9, max: 9 },     // Spain
      "+39": { min: 9, max: 10 },    // Italy
      "+31": { min: 9, max: 9 },     // Netherlands
      "+32": { min: 9, max: 9 },     // Belgium
      "+41": { min: 9, max: 9 },     // Switzerland
      "+43": { min: 10, max: 11 },   // Austria
      "+46": { min: 9, max: 10 },    // Sweden
      "+47": { min: 8, max: 8 },     // Norway
      "+45": { min: 8, max: 8 },     // Denmark
      "+7": { min: 10, max: 10 },    // Russia
      "+54": { min: 10, max: 11 },   // Argentina
      "+55": { min: 10, max: 11 },   // Brazil
      "+61": { min: 9, max: 9 },     // Australia
      "+27": { min: 9, max: 9 },     // South Africa
      "+251": { min: 9, max: 9 },    // Ethiopia
    };
    return validationRules[countryCode] || { min: 7, max: 15 };
  };

  const validatePhoneNumber = (phone: string, countryCode: string): string | null => {
    if (!phone) return null; // Phone is optional
    const { min, max } = getPhoneValidation(countryCode);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < min || digits.length > max) {
      if (min === max) {
        return `Phone number must be exactly ${min} digits for this country`;
      }
      return `Phone number must be between ${min} and ${max} digits for this country`;
    }
    return null;
  };

  // Handle profile photo file upload
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, profileImage: "Please upload a JPG, PNG, WebP, or GIF image" });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, profileImage: "File too large. Maximum size is 10MB" });
      return;
    }

    setIsUploadingProfile(true);
    setErrors({ ...errors, profileImage: "" });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch(`${API_URL}/uploads/public/image`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Upload failed");
      }

      const data = await response.json();
      setFormData({ ...formData, profileImage: data.url });
    } catch (error) {
      setErrors({
        ...errors,
        profileImage: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setIsUploadingProfile(false);
      // Reset input so the same file can be selected again
      if (profileInputRef.current) {
        profileInputRef.current.value = "";
      }
    }
  };

  // Handle portfolio image file upload
  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validFiles = Array.from(files).filter((file) => {
      if (!allowedTypes.includes(file.type)) return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length === 0) {
      setErrors({ ...errors, portfolioImages: "No valid images selected (JPG, PNG, WebP, GIF under 10MB)" });
      return;
    }

    setIsUploadingPortfolio(true);
    setErrors({ ...errors, portfolioImages: "" });

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const response = await fetch(`${API_URL}/uploads/public/image`, {
          method: "POST",
          body: formDataUpload,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData({
          ...formData,
          portfolioImages: [...formData.portfolioImages, ...uploadedUrls],
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        portfolioImages: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setIsUploadingPortfolio(false);
      // Reset input so the same files can be selected again
      if (portfolioInputRef.current) {
        portfolioInputRef.current.value = "";
      }
    }
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
    // Phone validation
    const phoneError = validatePhoneNumber(formData.phone, formData.phoneCountryCode);
    if (phoneError) {
      newErrors.phone = phoneError;
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
            subcategories: formData.customSubcategory
              ? [...formData.subcategories.filter(s => s !== "Other"), formData.customSubcategory]
              : formData.subcategories.filter(s => s !== "Other"),
            other_categories: formData.otherCategories,
            bio: formData.bio,
            country: formData.country,
            languages: formData.languages,
            performance_types: formData.performanceTypes.includes("Other") && formData.customPerformanceType
              ? [...formData.performanceTypes.filter(t => t !== "Other"), formData.customPerformanceType]
              : formData.performanceTypes,
            price_range_min: formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null,
            price_range_max: formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null,
            phone: formData.phone ? `${formData.phoneCountryCode} ${formData.phone}` : null,
            website: formData.website || null,
            instagram: formData.instagram || null,
            youtube: formData.youtube || null,
            facebook: formData.facebook || null,
            twitter: formData.twitter || null,
            linkedin: formData.linkedin || null,
            // Media fields - filter out empty strings
            profile_image: formData.profileImage || null,
            video_urls: formData.videoUrls.filter(url => url.trim() !== ""),
            portfolio_images: formData.portfolioImages.filter(url => url.trim() !== ""),
            spotify_links: formData.spotifyLinks.filter(url => url.trim() !== ""),
            media_links: formData.mediaLinks.filter(url => url.trim() !== ""),
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
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setErrors({ submit: errorMessage });
      showError(errorMessage);
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
                    <button
                      type="button"
                      onClick={() => handleToggleSubcategory("Other")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.subcategories.includes("Other")
                          ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      Other
                    </button>
                  </div>
                  {formData.subcategories.includes("Other") && (
                    <input
                      type="text"
                      value={formData.customSubcategory}
                      onChange={(e) => setFormData({ ...formData, customSubcategory: e.target.value })}
                      placeholder="Please specify your subcategory..."
                      className="mt-3 w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                    />
                  )}
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
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
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

              {/* Location - Country Only */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Based In
                </label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
                  <button
                    type="button"
                    onClick={() => handleTogglePerformanceType("Other")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.performanceTypes.includes("Other")
                        ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                        : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    Other
                  </button>
                </div>
                {formData.performanceTypes.includes("Other") && (
                  <input
                    type="text"
                    value={formData.customPerformanceType}
                    onChange={(e) => setFormData({ ...formData, customPerformanceType: e.target.value })}
                    placeholder="Please specify your performance type..."
                    className="mt-3 w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                  />
                )}
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
                      className={`h-full px-3 py-3.5 border-2 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white pr-10 text-teal-600 ${
                        errors.phone ? "border-red-300" : "border-slate-300"
                      }`}
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
                    className={`flex-1 px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors ${
                      errors.phone ? "border-red-300" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Pricing (USD)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 w-36">Single Performance:</span>
                    <span className="text-slate-500">$</span>
                    <input
                      type="text"
                      value={formData.priceRangeMin ? formatNumberWithCommas(formData.priceRangeMin) : ""}
                      onChange={(e) => setFormData({ ...formData, priceRangeMin: parseFormattedNumber(e.target.value) })}
                      placeholder="500"
                      className="w-32 px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 w-36">Tour Package:</span>
                    <span className="text-slate-500">$</span>
                    <input
                      type="text"
                      value={formData.priceRangeMax ? formatNumberWithCommas(formData.priceRangeMax) : ""}
                      onChange={(e) => setFormData({ ...formData, priceRangeMax: parseFormattedNumber(e.target.value) })}
                      placeholder="2,000"
                      className="w-32 px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Single Performance is your rate for one show. Tour Package is your rate for multiple shows in one trip.
                </p>
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

          {/* Media Upload Section */}
          <div className="mt-12 space-y-8">
            <h2 className="text-xl font-semibold text-slate-900">
              3 | Media & Portfolio <span className="text-slate-400 font-normal text-base">(Optional)</span>
            </h2>

            {/* Profile Photo */}
            <div>
              <label className="block text-base font-medium text-slate-800 mb-2">
                <Image className="inline mr-2" size={18} />
                Profile Photo
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Upload a professional photo that will appear on your profile (JPG, PNG, max 10MB)
              </p>
              {formData.profileImage ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.profileImage}
                    alt="Profile preview"
                    className="w-24 h-24 object-cover rounded-xl border-2 border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profileImage: "" })}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <label
                      htmlFor="profile-photo-upload"
                      className={`flex items-center gap-2 px-4 py-3 border-2 border-teal-300 bg-teal-50 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors ${
                        isUploadingProfile ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUploadingProfile ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload from Device
                        </>
                      )}
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>or paste URL:</span>
                    <input
                      type="url"
                      value={formData.profileImage}
                      onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                  {errors.profileImage && (
                    <p className="text-sm text-red-500">{errors.profileImage}</p>
                  )}
                </div>
              )}
            </div>

            {/* Video Clips */}
            <div>
              <label className="block text-base font-medium text-slate-800 mb-2">
                <Video className="inline mr-2" size={18} />
                Video Clips
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Add YouTube or Vimeo links to showcase your performances
              </p>
              <div className="space-y-2">
                {formData.videoUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.videoUrls];
                        newUrls[index] = e.target.value;
                        setFormData({ ...formData, videoUrls: newUrls });
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.videoUrls.filter((_, i) => i !== index);
                        setFormData({ ...formData, videoUrls: newUrls });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, videoUrls: [...formData.videoUrls, ""] })}
                  className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Video Link
                </button>
              </div>
            </div>

            {/* Portfolio Images */}
            <div>
              <label className="block text-base font-medium text-slate-800 mb-2">
                <Image className="inline mr-2" size={18} />
                Portfolio Images
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Upload images of your work (book covers, film stills, event photos, etc.)
              </p>

              {/* Uploaded Images Grid */}
              {formData.portfolioImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {formData.portfolioImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = formData.portfolioImages.filter((_, i) => i !== index);
                          setFormData({ ...formData, portfolioImages: newUrls });
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={portfolioInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handlePortfolioImageUpload}
                    className="hidden"
                    id="portfolio-upload"
                  />
                  <label
                    htmlFor="portfolio-upload"
                    className={`flex items-center gap-2 px-4 py-3 border-2 border-teal-300 bg-teal-50 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors ${
                      isUploadingPortfolio ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUploadingPortfolio ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Images
                      </>
                    )}
                  </label>
                  <span className="text-sm text-slate-500">Select multiple images</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>or add URL:</span>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-400 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setFormData({
                            ...formData,
                            portfolioImages: [...formData.portfolioImages, input.value.trim()],
                          });
                          input.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setFormData({
                          ...formData,
                          portfolioImages: [...formData.portfolioImages, input.value.trim()],
                        });
                        input.value = "";
                      }
                    }}
                    className="px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {errors.portfolioImages && (
                  <p className="text-sm text-red-500">{errors.portfolioImages}</p>
                )}
              </div>
            </div>

            {/* Spotify Links */}
            <div>
              <label className="block text-base font-medium text-slate-800 mb-2">
                <Music className="inline mr-2" size={18} />
                Spotify Links
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Add Spotify links to your tracks, albums, or artist profile
              </p>
              <div className="space-y-2">
                {formData.spotifyLinks.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.spotifyLinks];
                        newUrls[index] = e.target.value;
                        setFormData({ ...formData, spotifyLinks: newUrls });
                      }}
                      placeholder="https://open.spotify.com/..."
                      className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.spotifyLinks.filter((_, i) => i !== index);
                        setFormData({ ...formData, spotifyLinks: newUrls });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, spotifyLinks: [...formData.spotifyLinks, ""] })}
                  className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Spotify Link
                </button>
              </div>
            </div>

            {/* Media Articles */}
            <div>
              <label className="block text-base font-medium text-slate-800 mb-2">
                <FileText className="inline mr-2" size={18} />
                Press & Media Articles
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Add links to articles, interviews, or press coverage about you
              </p>
              <div className="space-y-2">
                {formData.mediaLinks.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.mediaLinks];
                        newUrls[index] = e.target.value;
                        setFormData({ ...formData, mediaLinks: newUrls });
                      }}
                      placeholder="https://example.com/article"
                      className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-teal-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.mediaLinks.filter((_, i) => i !== index);
                        setFormData({ ...formData, mediaLinks: newUrls });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mediaLinks: [...formData.mediaLinks, ""] })}
                  className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Media Link
                </button>
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
