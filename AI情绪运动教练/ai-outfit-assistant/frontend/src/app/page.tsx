import Link from "next/link";
import { Camera, Link as LinkIcon, ShoppingBag, Clock, Sparkles, User, Settings, Share2, MoreHorizontal, ChevronLeft } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Outfit
          </h1>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Settings className="w-6 h-6 text-foreground/80" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-8">

        {/* User Card (3D Avatar Placeholder) */}
        <section className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/10 border border-primary/10 shadow-xl">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Placeholder for 3D Figure */}
            <div className="relative w-48 h-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-80 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10 w-full h-full flex items-center justify-center text-primary/40">
                <span className="text-sm font-medium">3D Avatar Space</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 px-6 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur border border-border/50 shadow-sm text-xs font-medium">
                165cm · 52kg · Pear Shape
              </div>
            </div>
          </div>

          {/* Floating Actions */}
          <div className="absolute right-4 top-4 flex flex-col gap-3">
            <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg border border-border/50 text-foreground/80 hover:text-primary transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Action Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Start Try-On
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="group relative h-40 rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-1 shadow-lg hover:shadow-primary/25 transition-all active:scale-95">
              <div className="absolute inset-px rounded-[15px] bg-background/10 backdrop-blur-sm group-hover:bg-background/0 transition-colors" />
              <div className="relative h-full rounded-[15px] flex flex-col items-center justify-center gap-3 text-white">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-semibold">Upload Image</span>
              </div>
            </button>

            <button className="group h-40 rounded-2xl bg-card border border-border/50 p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:border-primary/50 transition-all active:scale-95">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LinkIcon className="w-6 h-6" />
              </div>
              <span className="font-medium text-foreground/80">Paste Link</span>
            </button>
          </div>
        </section>

        {/* AI Advisor Card */}
        <section>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-24 h-24" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Outfit Advisor</h3>
                  <p className="text-white/80 text-xs">Always here to help</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-sm border border-white/10">
                &quot;What should I wear for a date tonight? Tell me the occasion...&quot;
              </div>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-white text-violet-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors shadow-sm"
              >
                Start Chatting
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent
            </h2>
            <button className="text-xs text-muted-foreground hover:text-primary">View All</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-32 snap-center">
                <div className="aspect-[3/4] rounded-xl bg-muted/50 border border-border overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs">
                    Abstract Dress {i}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-[10px] font-medium">98% Match</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/40 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <div className="w-10 h-0.5 bg-primary absolute top-0 rounded-full" />
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-medium">Wardrobe</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
