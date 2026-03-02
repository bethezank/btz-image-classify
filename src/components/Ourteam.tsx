export default function Ourteam() {
    return (
        <section className="text-center space-y-12 py-12">
            <h3 className="text-3xl font-semibold">Our Team</h3>
            <div className="flex flex-wrap justify-center gap-16">

                {/* Team Member 1 */}
                <div className="space-y-6 group">
                    <div className="relative w-40 h-40 mx-auto">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors"></div>
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-4xl font-semibold text-white shadow-xl">
                            SY
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold">Satienpong Yiengvanichchakul</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">68-040628-5606-1</p>
                    </div>
                </div>

                {/* Team Member 2 */}
                <div className="space-y-6 group">
                    <div className="relative w-40 h-40 mx-auto">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-colors"></div>
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-semibold text-white shadow-xl">
                            JJ
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold">Jirapas Jatejaroungkit</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">68-040628-5601-0</p>
                    </div>
                </div>

            </div>
        </section>
    );
}