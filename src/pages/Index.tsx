import { Navbar } from "@/components/Navbar";
import { HeroCard } from "@/components/HeroCard";
import { CustomModelCard } from "@/components/CustomModelCard";
import Ourteam from "@/components/Ourteam";

const Index = () => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Layer */}
            <div className="fixed inset-0 z-[-2] lab-bg opacity-40" />

            {/* Content Layer */}
            <div className="relative z-[0]">
                <Navbar />

                <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                    {/* Built-in Model Section - Independent */}
                    <HeroCard />

                    {/* Custom/User's Model Section - Independent */}
                    <CustomModelCard />

                    <Ourteam />
                </main>

                <footer className="mt-20 py-12 px-6 glass-card border-t border-white/20 dark:border-white/10 text-center">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-loose max-w-sm mx-auto">
                            Educational project for AI System Integration. Department of<br />
                            Computer and Information Sciences, KMUTNB.
                        </p>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                            Bethezank Lab &copy; 2026
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Index;
