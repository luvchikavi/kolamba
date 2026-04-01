"use client";

const steps = [
  {
    number: "01",
    title: "DISCOVER",
    description:
      "Browse our curated selection of Israeli artists. Filter by category, language, and availability to find the perfect match for your community.",
    titleClass: "bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent",
    lineColor: "from-primary-400 to-primary-300",
  },
  {
    number: "02",
    title: "BOOK",
    description:
      "Send a booking request with your event details. Artists respond directly, and Kolamba helps coordinate tours to reduce costs for everyone.",
    titleClass: "bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent",
    lineColor: "from-accent-400 to-accent-300",
  },
  {
    number: "03",
    title: "EXPERIENCE",
    description:
      "Host an unforgettable cultural event. From concerts to workshops, bring Israeli culture to your community and create lasting connections.",
    titleClass: "bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent",
    lineColor: "from-accent-400 to-primary-400",
  },
];

export default function HowItWorksSteps() {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #CA7283 0%, #a889a0 30%, #8E96AB 50%, #6fa8b8 70%, #53B9CC 100%)" }}
    >
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-16 max-w-4xl mx-auto">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-accent-500 to-primary-500" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold italic text-white sm:whitespace-nowrap uppercase">
            How it Works
          </h2>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500" />
        </div>

        {/* Steps — staggered tall cards with dotted connectors */}
        <div className="max-w-5xl mx-auto relative">
          {/* Dotted S-curve connectors (desktop only) */}
          <svg
            className="absolute inset-0 w-full h-full z-0 hidden md:block pointer-events-none"
            viewBox="0 0 900 600"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Curve from card 1 bottom to card 2 top */}
            <path
              d="M200,380 C200,500 450,30 450,150"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray="6,8"
              opacity="0.6"
            />
            {/* Curve from card 2 bottom to card 3 top */}
            <path
              d="M450,420 C450,540 700,70 700,190"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray="6,8"
              opacity="0.6"
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 relative z-10">
            {steps.map((step, index) => {
              // Stagger: first at top, second offset down, third offset more
              const offsetClass =
                index === 0
                  ? "md:mt-0"
                  : index === 1
                  ? "md:mt-24"
                  : "md:mt-48";

              return (
                <div key={index} className={offsetClass}>
                  <div
                    className="bg-white p-6 sm:p-8 pt-8 sm:pt-10 text-center shadow-lg flex flex-col items-center md:min-h-[320px]"
                    style={{ borderRadius: "2.5rem 2.5rem 2.5rem 2.5rem" }}
                  >
                    {/* Top decorative line */}
                    <div className={`w-14 h-[2px] bg-gradient-to-r ${step.lineColor} mb-6`} />

                    {/* Step Number */}
                    <div className="text-3xl font-serif font-bold text-slate-900 italic mb-3">
                      {step.number}
                    </div>

                    {/* Bottom decorative line */}
                    <div className={`w-10 h-[2px] bg-gradient-to-r ${step.lineColor} mb-6`} />

                    {/* Title */}
                    <h3 className={`text-2xl font-bold ${step.titleClass} mb-4 tracking-wide italic`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
