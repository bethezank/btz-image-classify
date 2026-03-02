import { useEffect, useState } from "react";

export const Navbar = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theory
        if (document.documentElement.classList.contains("dark")) {
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full glass-card border-b border-white/20 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <span className="material-symbols-rounded">pets</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Image Classification Platform</h1>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Computer and Information Sciences, KMUTNB
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-sm font-medium">Department of Applied Science</span>
                    <span className="text-[11px] text-slate-500">Fine-Tuned Models (GoogleNet/SqueezeNet)</span>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                    {isDark ? (
                        <span className="material-symbols-rounded block">light_mode</span>
                    ) : (
                        <span className="material-symbols-rounded block">dark_mode</span>
                    )}
                </button>
            </div>
        </header>
    );
};
