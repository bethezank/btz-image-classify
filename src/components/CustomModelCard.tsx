import { FileUploadCard } from "./FileUploadCard";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface CustomModelCardProps {
    onnxFile: File | null;
    classFile: File | null;
    imageFile: File | null;
    setOnnxFile: (file: File | null) => void;
    setClassFile: (file: File | null) => void;
    setImageFile: (file: File | null) => void;
    onLoadModel: () => void;
    onPredict: () => void;
    isLoading: boolean;
    hasSession: boolean;
    predictions: any[];
}

export const CustomModelCard = ({
    onnxFile,
    classFile,
    imageFile,
    setOnnxFile,
    setClassFile,
    setImageFile,
    onLoadModel,
    onPredict,
    isLoading,
    hasSession,
    predictions
}: CustomModelCardProps) => {
    return (
        <section className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="flex flex-col items-start gap-2 mb-6">
                <h3 className="text-3xl font-extrabold uppercase tracking-wide">เลือกใช้โมเดล AI ของคุณ</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">เลือกใช้โมเดลของคุณเพื่อวิเคราะห์รูปภาพที่เป็นนามสกุล onnx และ class labels (json)</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 justify-center items-start">
                <div className="space-y-8 text-left">

                    <div className="grid gap-6">
                        <FileUploadCard
                            label="ONNX Model"
                            accept=".onnx"
                            onChange={setOnnxFile}
                            fileName={onnxFile?.name}
                            iconName="psychology"
                            colorClass="blue"
                        />
                        <FileUploadCard
                            label="Class Labels (JSON)"
                            accept=".json"
                            onChange={setClassFile}
                            fileName={classFile?.name}
                            iconName="description"
                            colorClass="purple"
                        />
                        <FileUploadCard
                            label="Target Image"
                            accept="image/*"
                            onChange={setImageFile}
                            fileName={imageFile?.name}
                            iconName="image"
                            colorClass="pink"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onLoadModel}
                            disabled={isLoading || !onnxFile || !classFile}
                            className="flex-1 px-8 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            {isLoading && !hasSession ? "Registering..." : "1. Register Model"}
                        </button>
                        <button
                            onClick={onPredict}
                            disabled={isLoading || !hasSession || !imageFile}
                            className="flex-1 px-8 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 disabled:hover:translate-y-0"
                        >
                            {isLoading && hasSession ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-rounded block">analytics</span>}
                            {isLoading && hasSession ? "Analyzing..." : "2. Analyze Breed"}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Preview & Results */}
                <div className="relative group min-h-[400px]">
                    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl h-full flex flex-col justify-between">

                        <div className="aspect-[4/3] relative flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            {imageFile ? (
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Cat Preview"
                                    className="max-w-full max-h-full object-contain"
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
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">ANALYSIS RESULTS</span>
                                </div>
                                <div className="space-y-4">
                                    {predictions.slice(0, 5).map((p, i) => {
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
