"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Home, 
  ChevronRight, 
  User, 
  Mail, 
  HelpCircle, 
  Phone, 
  MapPin, 
  Clock
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg font-[Inter,sans-serif] text-text pb-24">
      {/* Navbar (from homepage) */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted transition-colors hover:text-text"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted mb-8 font-medium">
          <Link href="/" className="flex items-center gap-2 hover:text-text transition-colors">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text">Contact Us</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-[32px] bg-surface border border-border p-12 md:p-20 flex flex-col items-center justify-center text-center mb-6"
        >
          <div className="inline-flex items-center rounded-full border border-border bg-bg px-4 py-1.5 text-xs font-semibold tracking-wider text-text uppercase mb-8 shadow-sm">
            Contact Us
          </div>
          <h1 className="font-[Space_Grotesk,sans-serif] text-4xl md:text-5xl font-bold text-text mb-6">
            Let's Start a Conversation
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Have a question, feedback, or want to discuss a project? We'd love to hear from you. 
            Our team is ready to help you succeed.
          </p>
        </motion.div>

        {/* Form and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 rounded-[32px] bg-surface border border-border p-8 md:p-10"
          >
            <h2 className="text-2xl font-bold text-text mb-2">Send us a message</h2>
            <p className="text-sm text-muted mb-8">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text">
                    Full Name <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-muted" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full rounded-2xl border border-border bg-bg py-3.5 pl-11 pr-4 text-sm text-text placeholder-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-muted" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="john@company.com"
                      className="w-full rounded-2xl border border-border bg-bg py-3.5 pl-11 pr-4 text-sm text-text placeholder-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text">
                  Subject <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <HelpCircle className="w-4 h-4 text-muted" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="How can we help you?"
                    className="w-full rounded-2xl border border-border bg-bg py-3.5 pl-11 pr-4 text-sm text-text placeholder-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-text">
                  Message <span className="text-accent">*</span>
                </label>
                <textarea 
                  placeholder="Tell us about your project, question, or feedback..."
                  rows={5}
                  className="w-full rounded-2xl border border-border bg-bg p-4 text-sm text-text placeholder-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none"
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted/60">
                  0/2000
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full rounded-full bg-text hover:bg-white text-bg font-semibold py-4 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Right: Contact Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 rounded-[32px] bg-surface border border-border p-8 md:p-10 flex flex-col"
          >
            <div className="space-y-8 flex-1">
              
              {/* Email */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg">
                  <Mail className="h-5 w-5 text-text" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-muted mb-1">Email</p>
                  <p className="text-sm font-semibold text-text">hello@yourbrand.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg">
                  <Phone className="h-5 w-5 text-text" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-muted mb-1">Phone</p>
                  <p className="text-sm font-semibold text-text">+1 (555) 123-4567</p>
                </div>
              </div>

              {/* Office */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg">
                  <MapPin className="h-5 w-5 text-text" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-muted mb-1">Office</p>
                  <p className="text-sm font-semibold text-text leading-snug">
                    123 Innovation Street, San Francisco, CA<br/>94102
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg">
                  <Clock className="h-5 w-5 text-text" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-muted mb-1">Business Hours</p>
                  <p className="text-sm font-semibold text-text">Mon - Fri: 9:00 AM - 6:00 PM (PST)</p>
                </div>
              </div>

            </div>

            {/* Status Indicator */}
            <div className="mt-10 mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-bg px-3 py-1.5 self-start shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-muted uppercase">Usually responds within 24 hours</span>
            </div>

            {/* Divider with Text */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface px-4 text-[10px] font-semibold text-muted uppercase tracking-widest">Follow Us</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg text-muted hover:text-text hover:bg-border/50 transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg text-muted hover:text-text hover:bg-border/50 transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg text-muted hover:text-text hover:bg-border/50 transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.2-.4-2.4-1.2-3.2 3-.3 6-1.5 6-6.5 0-1.4-.5-2.7-1.4-3.7.1-.3.6-1.7-.1-3.7 0 0-1.2-.4-3.9 1.4-1.2-.3-2.5-.5-3.8-.5-1.3 0-2.6.2-3.8.5-2.7-1.8-3.9-1.4-3.9-1.4-.7 2-.2 3.4-.1 3.7-.9 1-1.4 2.3-1.4 3.7 0 5 3 6.2 6 6.5-.8.8-1.2 2-1.2 3.2V23"></path>
                </svg>
              </a>
            </div>
            
          </motion.div>

        </div>
      </main>
    </div>
  );
}
