"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PublicNavbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="font-[Space_Grotesk,sans-serif] text-sm font-bold text-white">
                G
              </span>
            </div>
            <span className="font-[Space_Grotesk,sans-serif] text-xl font-bold">
              Grob
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="text-sm font-medium text-muted transition-colors hover:text-text"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
          >
            Get started
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
