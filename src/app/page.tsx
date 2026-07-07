import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl">Grob</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Deploy your apps in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                seconds
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Import your Git repository, configure your build, and deploy with a single click.
              Built for modern web frameworks.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200"
              >
                Start Deploying
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                View Docs
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Git Integration", desc: "Connect any Git repository and deploy automatically on every push." },
                { title: "Instant Rollbacks", desc: "Instantly roll back to any previous deployment with zero downtime." },
                { title: "Custom Domains", desc: "Add custom domains with automatic SSL certificates." },
              ].map((f) => (
                <div key={f.title} className="p-6 rounded-xl border bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
