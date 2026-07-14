import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Image,
  Settings,
  Save,
  Globe,
  HardDrive,
  Smartphone,
  Monitor,
} from "lucide-react";

export default async function ImagesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const remotePatterns = [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "cdn.example.com" },
    { protocol: "https", hostname: "*.s3.amazonaws.com" },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Images</h2>
        <p className="text-muted text-sm">
          Image optimization settings for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Optimization Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Image className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Optimized Images
              </p>
            </div>
            <p className="text-2xl font-bold text-text">47</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-info" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Total Size Saved
              </p>
            </div>
            <p className="text-2xl font-bold text-text">842 KB</p>
            <p className="text-xs text-muted mt-1">
              From 1.8 MB to 958 KB
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-success" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Avg Reduction
              </p>
            </div>
            <p className="text-2xl font-bold text-text">46.8%</p>
            <p className="text-xs text-muted mt-1">
              Size reduction per image
            </p>
          </div>
        </div>
      </section>

      {/* Optimization Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">
            Optimization Settings
          </h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Default Width
              </label>
              <input
                type="number"
                defaultValue={1920}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Default Height
              </label>
              <input
                type="number"
                defaultValue={1080}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted">Quality</label>
                <span className="text-xs text-text font-mono font-medium">
                  80
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                defaultValue="80"
                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>Smaller</span>
                <span>Higher quality</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Format
              </label>
              <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors">
                <option value="auto">Auto</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
            <Save className="w-4 h-4" />
            Save Optimization Settings
          </button>
        </div>
      </section>

      {/* Device Sizes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Device Sizes</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-muted mb-3">
            Responsive image widths generated for different device viewports.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[640, 750, 828, 1080, 1200, 1920].map((size) => (
              <div
                key={size}
                className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2"
              >
                <span className="text-sm font-mono text-text">{size}</span>
                <span className="text-[10px] text-muted">px</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-accent hover:underline">
            + Add device size
          </button>
        </div>
      </section>

      {/* Image Sizes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Image Sizes</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-muted mb-3">
            Maximum image sizes for generated thumbnails and responsive variants.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[16, 32, 48, 64, 96, 128, 256, 384].map((size) => (
              <div
                key={size}
                className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2"
              >
                <span className="text-sm font-mono text-text">{size}</span>
                <span className="text-[10px] text-muted">px</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-accent hover:underline">
            + Add image size
          </button>
        </div>
      </section>

      {/* Remote Patterns */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Remote Patterns</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <p className="text-xs text-muted">
            External image domains allowed for optimization. All other domains
            will be served without optimization.
          </p>
          {remotePatterns.map((pattern, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-bg border border-border rounded-lg px-4 py-3"
            >
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-info uppercase">
                  {pattern.protocol}
                </span>
                <code className="text-xs font-mono text-text">
                  {pattern.hostname}
                </code>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <select className="px-3 py-2 border border-border rounded-lg text-xs text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors">
              <option>https</option>
              <option>http</option>
            </select>
            <input
              placeholder="hostname (e.g., images.example.com)"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-xs font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
            <button className="px-4 py-2 text-xs font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
