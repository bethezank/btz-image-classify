import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeroCardProps {
    activeModel: string | null;
    onSelectModel: (modelName: string, onnxFile: File, classFile: File) => void;
    onPredict: (image: File) => Promise<void>;
    predictions: any[];
    isLoading: boolean;
}

export const HeroCard = ({ activeModel, onSelectModel, onPredict, predictions, isLoading }: HeroCardProps) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [fetchingModel, setFetchingModel] = useState<string | null>(null);
    const { toast } = useToast();

    const handleModelSelect = async (name: string, modelUrl: string, classUrl: string) => {
        setFetchingModel(name);
        try {
            const [mRes, cRes] = await Promise.all([fetch(modelUrl), fetch(classUrl)]);
            const mBlob = await mRes.blob();
            const cBlob = await cRes.blob();
            const mFile = new File([mBlob], `${name}.onnx`, { type: "application/octet-stream" });
            const cFile = new File([cBlob], "labels.json", { type: "application/json" });
            onSelectModel(name, mFile, cFile);
        } catch (e) {
            toast({ title: "Error", description: "Failed to load model", variant: "destructive" });
        } finally {
            setFetchingModel(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    return (
        <section className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

                {/* LEFT COLUMN: Controls */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                        <span className="material-symbols-rounded text-base">auto_awesome</span>
                        Built-in Intelligence
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            ทดลองใช้ AI ของเรา<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">เพื่อระบุสายพันธุ์แมว</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                            ทดสอบการจำแนกสายพันธุ์แมวด้วยโมเดลเรา Fine-tune จาก GoogleNet หรือ SqueezeNet โดยตรงในบราวเซอร์ของคุณ
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">เลือกโมเดล</p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => handleModelSelect("GoogleNet-cat", "/models/trainedGoogleNet-cat.onnx", "/classes/classNames-cat.json")}
                                disabled={!!fetchingModel}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-sm ${activeModel === "GoogleNet-cat"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105 border border-transparent"
                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary group"
                                    }`}
                            >
                                {fetchingModel === "GoogleNet-cat" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className={`material-symbols-rounded ${activeModel === "GoogleNet-cat" ? "text-white" : "text-slate-400 group-hover:text-primary"}`}>developer_board</span>
                                )}
                                <span className="font-semibold">GoogleNet</span>
                            </button>

                            <button
                                onClick={() => handleModelSelect("SqueezeNet-cat", "/models/trainedSqueezeNet-cat.onnx", "/classes/classNames-cat.json")}
                                disabled={!!fetchingModel}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-sm ${activeModel === "SqueezeNet-cat"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105 border border-transparent"
                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary group"
                                    }`}
                            >
                                {fetchingModel === "SqueezeNet-cat" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className={`material-symbols-rounded ${activeModel === "SqueezeNet-cat" ? "text-white" : "text-slate-400 group-hover:text-primary"}`}>memory</span>
                                )}
                                <span className="font-semibold">SqueezeNet</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">อัปโหลดรูปภาพแมวที่ต้องการทำนาย</p>
                        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-2 text-center hover:bg-white/50 dark:hover:bg-white/5 transition-all cursor-pointer group flex flex-col items-center justify-center">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-rounded text-primary text-3xl">upload_file</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">
                                {selectedImage ? selectedImage.name : <>Drop image here or <span className="text-primary font-semibold">click to browse</span></>}
                            </p>
                        </label>
                    </div>

                    <button
                        onClick={() => selectedImage && onPredict(selectedImage)}
                        disabled={!selectedImage || !activeModel || isLoading}
                        className="w-full md:w-auto px-10 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="material-symbols-rounded">analytics</span>}
                        {isLoading ? "กำลังทำนาย..." : "ทำนายเลย !"}
                    </button>
                </div>

                {/* RIGHT COLUMN: Preview & Results */}
                <div className="relative group min-h-[400px]">
                    {/* <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div> */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl h-full flex flex-col justify-between">

                        <div className="aspect-[4/3] relative flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            {selectedImage ? (
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Cat Preview"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
                                    <span className="material-symbols-rounded text-6xl">image</span>
                                    <p className="font-bold tracking-widest uppercase text-xs">Waiting for Image</p>
                                </div>
                            )}
                        </div>

                        {predictions.length > 0 && !isLoading && (
                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">ผลการทำนาย</span>
                                </div>
                                <div className="space-y-4">
                                    {predictions.slice(0, 3).map((p, i) => {
                                        // Assign colors to top 3
                                        const barColors = ["bg-primary", "bg-blue-400", "bg-purple-400"];
                                        const percent = (p.probability * 100).toFixed(1);
                                        return (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span>{p.className}</span>
                                                    <span>{percent}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full ${barColors[i] || "bg-slate-400"} rounded-full`} style={{ width: `${percent}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
};
