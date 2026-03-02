import { useState } from "react";
import { FileUploadCard } from "./FileUploadCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadONNXModel, loadClassLabels, preprocessImage, runInference } from "@/utils/onnxInference";
import type { InferenceSession } from "onnxruntime-web";

interface Prediction {
    className: string;
    probability: number;
}

export const CustomModelCard = () => {
    const { toast } = useToast();

    // Independent state for Custom Model section
    const [onnxFile, setOnnxFile] = useState<File | null>(null);
    const [classFile, setClassFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [session, setSession] = useState<InferenceSession | null>(null);
    const [classLabels, setClassLabels] = useState<string[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSession, setHasSession] = useState(false);

    const handleLoadModel = async () => {
        if (!onnxFile || !classFile) {
            toast({ 
                title: "Missing Files", 
                description: "Please upload ONNX and JSON files.", 
                variant: "destructive" 
            });
            return;
        }

        setIsLoading(true);
        setPredictions([]);

        try {
            const loadedSession = await loadONNXModel(onnxFile);
            const loadedLabels = await loadClassLabels(classFile);
            setSession(loadedSession);
            setClassLabels(loadedLabels);
            setHasSession(true);
            toast({
                title: "Model Registered",
                description: "Custom model is ready for inference.",
            });
        } catch (e) {
            toast({
                title: "Load Failed",
                description: "Could not initialize ONNX session.",
                variant: "destructive"
            });
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePredict = async () => {
        if (!session || !classLabels.length) {
            toast({ 
                title: "Model Not Ready", 
                description: "Please load a model first.", 
                variant: "destructive" 
            });
            return;
        }
        if (!imageFile) {
            toast({ 
                title: "Missing Image", 
                description: "Please upload an image to analyze.", 
                variant: "destructive" 
            });
            return;
        }

        setIsLoading(true);
        try {
            const inputTensor = await preprocessImage(imageFile, 224);
            const results = await runInference(session, inputTensor, classLabels);
            setPredictions(results);
        } catch (error) {
            toast({ 
                title: "Analysis Failed", 
                variant: "destructive" 
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetOnnxFile = (file: File | null) => {
        setOnnxFile(file);
        setHasSession(false);
        setPredictions([]);
    };

    const handleSetClassFile = (file: File | null) => {
        setClassFile(file);
        setHasSession(false);
        setPredictions([]);
    };

    const handleSetImageFile = (file: File | null) => {
        setImageFile(file);
        setPredictions([]);
    };

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
                            onChange={handleSetOnnxFile}
                            fileName={onnxFile?.name}
                            iconName="psychology"
                            colorClass="blue"
                        />
                        <FileUploadCard
                            label="Class Labels (JSON)"
                            accept=".json"
                            onChange={handleSetClassFile}
                            fileName={classFile?.name}
                            iconName="description"
                            colorClass="purple"
                        />
                        <FileUploadCard
                            label="Target Image"
                            accept="image/*"
                            onChange={handleSetImageFile}
                            fileName={imageFile?.name}
                            iconName="image"
                            colorClass="pink"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleLoadModel}
                            disabled={isLoading || !onnxFile || !classFile}
                            className="flex-1 px-8 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            {isLoading && !hasSession ? "Registering..." : "1. Register Model"}
                        </button>
                        <button
                            onClick={handlePredict}
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
