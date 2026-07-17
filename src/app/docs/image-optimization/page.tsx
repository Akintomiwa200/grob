"use client";

import { useState } from "react";
import { Globe, RefreshCw, Sliders, CheckCircle2 } from "lucide-react";

type Format = "avif" | "webp" | "jpeg" | "original";

export default function ImageOptimizationPage() {
  const [format, setFormat] = useState<Format>("avif");
  const [width, setWidth] = useState(800);
  const [isCompiling, setIsCompiling] = useState(false);
  const [metrics, setMetrics] = useState<{
    originalSize: number;
    optimizedSize: number;
    savings: number;
  } | null>(null);

  const triggerOptimization = async () => {
    setIsCompiling(true);
    setMetrics(null);

    await wait(600);

    // Calculate sizes
    const original = 2.4 * 1024 * 1024; // 2.4 MB base
    let factor = 1.0;

    // width factor
    if (width === 400) factor = 0.25;
    else if (width === 800) factor = 0.65;
    else factor = 1.0;

    // format factor
    let formatFactor = 1.0;
    if (format === "avif") formatFactor = 0.04;
    else if (format === "webp") formatFactor = 0.08;
    else if (format === "jpeg") formatFactor = 0.25;

    const optimized = original * factor * formatFactor;
    const savings = ((original - optimized) / original) * 100;

    setMetrics({
      originalSize: Number((original / (1024 * 1024)).toFixed(2)),
      optimizedSize: Number((optimized / 1024).toFixed(1)),
      savings: Number(savings.toFixed(1))
    });

    setIsCompiling(false);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Features</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Image Optimization
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Grob optimizes, resizes, and converts images on the fly. Dynamically deliver modern image formats like AVIF or WebP to web browsers without manually compiling file directories.
      </p>

      {/* Optimizer simulator */}
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-accent animate-pulse" /> Dynamic Image Resizer Engine
      </h2>

      <div className="grid gap-6 lg:grid-cols-12 mb-12">
        {/* Left Side: Parameters */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xl lg:col-span-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-text mb-2 flex items-center gap-1"><Sliders className="h-4.5 w-4.5 text-accent" /> Parameters</h3>
            
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Output Format</label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value as Format);
                  setMetrics(null);
                }}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
              >
                <option value="avif">AVIF (Ultra Compression)</option>
                <option value="webp">WebP (Standard Compression)</option>
                <option value="jpeg">JPEG (Quality optimized)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Output Width</label>
              <select
                value={width}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  setMetrics(null);
                }}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
              >
                <option value={400}>400 px (Mobile / Thumbnails)</option>
                <option value={800}>800 px (Tablet / Medium)</option>
                <option value={1200}>1200 px (Desktop / Full)</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={triggerOptimization}
              disabled={isCompiling}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
            >
              {isCompiling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Optimize Image"}
            </button>
          </div>
        </div>

        {/* Right Side: Visualization / Metrics */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xl lg:col-span-6 flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="font-bold text-sm text-text mb-4">Compression Metrics</h3>
            {metrics ? (
              <div className="space-y-4">
                <div className="grid gap-3 grid-cols-2 text-center text-xs font-bold">
                  <div className="p-3 bg-bg border border-border rounded-xl">
                    <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Original Size</span>
                    <span className="text-base text-text">{metrics.originalSize} MB</span>
                  </div>
                  <div className="p-3 bg-bg border border-border rounded-xl">
                    <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Optimized Size</span>
                    <span className="text-base text-success">{metrics.optimizedSize} KB</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-success/5 border border-success/15 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 bg-success/15 flex items-center justify-center rounded-full text-success">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-success">{metrics.savings}% Storage Saved</span>
                    <span className="block text-xs text-muted font-semibold mt-0.5">Images load {(100 / (100 - metrics.savings)).toFixed(0)}x faster.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted/50 text-center py-12 text-sm font-semibold">
                Set parameters and click &quot;Optimize Image&quot; to test.
              </div>
            )}
          </div>

          <div className="border-t border-border/80 pt-3 text-[10px] font-mono text-muted/65 leading-relaxed">
            API url: <code className="text-[10px] text-accent">https://your-domain.com/_grob/image?url=logo.png&w={width}&q=80</code>
          </div>
        </div>
      </div>
    </div>
  );
}
