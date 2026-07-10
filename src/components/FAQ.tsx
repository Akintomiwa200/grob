"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

type Category = "All" | "Templates" | "Licensing" | "Components" | "Support";

interface Question {
  id: string;
  question: string;
  answer: string;
  category: Exclude<Category, "All">;
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "How do I download the templates after purchase?",
    answer: "After completing your purchase, you will receive an email with a secure download link. You can also access your downloads at any time from your account dashboard under the 'Purchases' tab.",
    category: "Templates",
  },
  {
    id: "q2",
    question: "Are updates included in the price?",
    answer: "Yes, all our templates and components include free lifetime updates. You will be notified via email whenever a new version is released.",
    category: "Licensing",
  },
  {
    id: "q3",
    question: "Can I use the templates for client projects?",
    answer: "Absolutely! The standard license allows you to use the templates for both personal and commercial projects, including work you do for clients.",
    category: "Licensing",
  },
  {
    id: "q4",
    question: "Are the components compatible with my framework?",
    answer: "Our components are built with React and Tailwind CSS. They are fully compatible with Next.js, Vite, Create React App, and any other React-based environment.",
    category: "Components",
  },
  {
    id: "q5",
    question: "Is there technical support available if I need help?",
    answer: "Yes, we provide 6 months of premium technical support with every purchase. You can reach out to our team via the support portal or email.",
    category: "Support",
  },
  {
    id: "q6",
    question: "Can I request custom modifications to the templates?",
    answer: "While we don't offer custom development services directly, our templates are designed to be highly modular and easy to modify. If you need extensive customizations, we recommend hiring a freelance developer.",
    category: "Templates",
  },
];

const CATEGORIES = [
  { name: "All", count: 10 },
  { name: "Templates", count: 3 },
  { name: "Licensing", count: 3 },
  { name: "Components", count: 2 },
  { name: "Support", count: 2 },
];

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredQuestions = QUESTIONS.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || q.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-24 bg-bg text-text font-[Inter,sans-serif]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Header */}
        <div className="mb-4 inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          Frequently Asked Questions
        </div>
        
        <h2 className="mb-4 text-center font-[Space_Grotesk,sans-serif] text-3xl font-bold tracking-tight md:text-5xl">
          Got Questions?
        </h2>
        
        <p className="mb-10 text-center text-muted max-w-xl">
          Find answers to common questions about our templates, components, and licensing options.
        </p>

        {/* Search */}
        <div className="relative w-full max-w-xl mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name as Category)}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.name
                  ? "border-accent bg-accent/10 text-text"
                  : "border-border bg-surface text-muted hover:text-text"
              }`}
            >
              {cat.name}
              <span className={`flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] ${
                activeCategory === cat.name ? "bg-accent/20 text-accent" : "bg-border text-muted"
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="w-full flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;
              
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className={`w-full flex items-center justify-between rounded-xl border p-5 text-left transition-colors ${
                      isExpanded ? "border-accent bg-accent/5" : "border-border bg-surface hover:border-border/80"
                    }`}
                  >
                    <span className="font-medium text-sm sm:text-base text-text">{q.question}</span>
                    <div className="flex items-center gap-3">
                       <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-bg px-2.5 py-1 text-[10px] text-muted">
                         {q.category}
                       </span>
                       <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${isExpanded ? "rotate-180 text-accent" : ""}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-3 text-sm leading-relaxed text-muted border-x border-b border-border/50 rounded-b-xl -mt-2 bg-surface/50">
                          {q.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredQuestions.length === 0 && (
            <div className="text-center text-sm text-muted py-8">
              No questions found matching your search.
            </div>
          )}
        </div>
        
        {/* Show More */}
        <button className="mt-8 rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-medium text-text transition-colors hover:bg-border/50">
          Show More Questions
        </button>

      </div>
    </section>
  );
}
