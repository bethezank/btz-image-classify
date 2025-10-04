// 8. Out Team
const Ourteam = () => {
    return (
        <section className="py-16 px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                    Our Team
                </h2>
                <div className="flex flex-wrap justify-center gap-12">
                    {/* Team Member 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-4xl font-bold text-primary-foreground">SY</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Satienpong Yiengvanichchakul</h3>
                        <p className="text-sm text-muted-foreground">68-040628-5606-1</p>
                    </div>

                    {/* Team Member 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-4xl font-bold text-primary-foreground">JJ</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Jirapas Jatejaroungkit</h3>
                        <p className="text-sm text-muted-foreground">68-040628-5601-0</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Ourteam