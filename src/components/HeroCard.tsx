import { useState, useEffect } from "react";
import { Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadONNXModel, loadClassLabels, preprocessImage, runInference } from "@/utils/onnxInference";
import type { InferenceSession } from "onnxruntime-web";
import { GoogleIcon } from "./icons/GoogleIcon";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Prediction {
    className: string;
    probability: number;
}

export const HeroCard = () => {
    const { toast } = useToast();

    // Independent state for Built-in Model section
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [fetchingModel, setFetchingModel] = useState<string | null>(null);
    const [activeModel, setActiveModel] = useState<string | null>(null);
    const [session, setSession] = useState<InferenceSession | null>(null);
    const [classLabels, setClassLabels] = useState<string[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [builtInClassLabels, setBuiltInClassLabels] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'comparison'>('summary');

    // Load built-in class labels on mount
    useEffect(() => {
        const loadBuiltInLabels = async () => {
            try {
                const response = await fetch("/classes/classNames-cat.json");
                const labels = await response.json();
                setBuiltInClassLabels(labels);
            } catch (error) {
                console.error("Failed to load class labels:", error);
            }
        };
        loadBuiltInLabels();
    }, []);

    const handleModelSelect = async (name: string, modelUrl: string, classUrl: string) => {
        setFetchingModel(name);
        setIsLoading(true);
        setPredictions([]);

        try {
            const [mRes, cRes] = await Promise.all([fetch(modelUrl), fetch(classUrl)]);
            const mBlob = await mRes.blob();
            const cBlob = await cRes.blob();
            const mFile = new File([mBlob], `${name}.onnx`, { type: "application/octet-stream" });
            const cFile = new File([cBlob], "labels.json", { type: "application/json" });

            const loadedSession = await loadONNXModel(mFile);
            const loadedLabels = await loadClassLabels(cFile);

            setSession(loadedSession);
            setClassLabels(loadedLabels);
            setActiveModel(name);

            toast({
                title: "โมเดลพร้อมใช้งาน",
                description: `${name} โหลดเสร็จสิ้น พร้อมทำนายรูปภาพ`,
            });
        } catch (e) {
            toast({
                title: "Error",
                description: "Failed to load model",
                variant: "destructive"
            });
            console.error(e);
        } finally {
            setFetchingModel(null);
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setPredictions([]);
        }
    };

    const handlePredict = async () => {
        if (!session || !classLabels.length) {
            toast({
                title: "Model Not Ready",
                description: "Please select a model first.",
                variant: "destructive"
            });
            return;
        }
        if (!selectedImage) {
            toast({
                title: "Missing Image",
                description: "Please upload an image to analyze.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const inputTensor = await preprocessImage(selectedImage, 224);
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

    return (
        <section className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="flex flex-col items-start gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    <span className="material-symbols-rounded text-base">auto_awesome</span>
                    Built-in Intelligence
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    ทดลองใช้โมเดลของเราเพื่อระบุสายพันธุ์แมว
                </h3>
                <p className="text-muted-foreground text-base">
                    ทดสอบการจำแนกสายพันธุ์แมวด้วยโมเดลที่ผ่านการ Fine-tune ที่มีพื้นฐานจาก GoogleNet หรือ ResNet-50 ได้โดยตรงในบราวเซอร์ของคุณ
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">

                {/* LEFT COLUMN: Controls */}
                <div className="space-y-8">
                    {/* Section: เลือกโมเดล */}
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">เลือกโมเดล</p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => handleModelSelect("GoogleNet", "/models/cat-10breeds-net-google.onnx", "/classes/classNames-cat.json")}
                                disabled={!!fetchingModel}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-sm ${activeModel === "GoogleNet"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 border border-transparent"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary group text-slate-700 dark:text-slate-200"
                                    }`}
                            >
                                {fetchingModel === "GoogleNet" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <GoogleIcon className="w-5 h-5" />
                                )}
                                <span className="font-semibold">GoogLeNet</span>
                            </button>

                            <button
                                onClick={() => handleModelSelect("ResNet-50", "/models/cat-10breeds-net-resnet50.onnx", "/classes/classNames-cat.json")}
                                disabled={!!fetchingModel}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-sm ${activeModel === "ResNet-50"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 border border-transparent"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary group text-slate-700 dark:text-slate-200"
                                    }`}
                            >
                                {fetchingModel === "ResNet-50" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className={`material-symbols-rounded ${activeModel === "ResNet-50" ? "text-white" : "text-slate-400 group-hover:text-primary"}`}>layers</span>
                                )}
                                <span className="font-semibold">ResNet-50</span>
                            </button>
                        </div>

                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary rounded-full transition-colors shadow-sm">
                                        <span className="material-symbols-rounded text-[16px]">info</span>
                                        ข้อมูลความแม่นยำของโมเดล
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl text-center md:text-left text-slate-900 dark:text-white">ข้อมูลความแม่นยำของโมเดล</DialogTitle>
                                        <DialogDescription className="text-center md:text-left text-slate-600 dark:text-slate-400">
                                            เปรียบเทียบประสิทธิภาพระหว่าง GoogLeNet และ ResNet-50
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mt-6 max-w-sm mx-auto md:mx-0">
                                        <button
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                            onClick={() => setActiveTab('summary')}
                                        >
                                            <span className="material-symbols-rounded text-[18px]">analytics</span>
                                            Summary
                                        </button>
                                        <button
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'comparison' ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                            onClick={() => setActiveTab('comparison')}
                                        >
                                            <span className="material-symbols-rounded text-[18px]">compare_arrows</span>
                                            Model comparison
                                        </button>
                                    </div>

                                    {activeTab === 'summary' ? (
                                        <div className="mt-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <img src="/results/compare.webp" alt="Model Accuracy Summary" className="w-full h-auto object-contain" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-8 mt-6 animate-in fade-in zoom-in-95 duration-200">
                                            {/* GoogLeNet Column */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                                        <GoogleIcon className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">GoogLeNet</h3>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-rounded text-[18px] text-slate-400">grid_on</span>
                                                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confusion Matrix</h4>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                                                            <img src="/results/google-matrix.png" alt="GoogLeNet Confusion Matrix" className="w-full h-auto rounded-xl" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-rounded text-[18px] text-slate-400">bar_chart</span>
                                                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">Classification Report</h4>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                                                            <img src="/results/google-score.png" alt="GoogLeNet Score" className="w-full h-auto rounded-xl" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ResNet-50 Column */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <span className="material-symbols-rounded">layers</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">ResNet-50</h3>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-rounded text-[18px] text-slate-400">grid_on</span>
                                                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confusion Matrix</h4>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                                                            <img src="/results/resnet50-matrix.png" alt="ResNet-50 Confusion Matrix" className="w-full h-auto rounded-xl" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-rounded text-[18px] text-slate-400">bar_chart</span>
                                                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">Classification Report</h4>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                                                            <img src="/results/resnet50-score.png" alt="ResNet-50 Score" className="w-full h-auto rounded-xl" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Section: ดู Class Labels */}
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Class Labels</p>
                        <div className="flex flex-wrap gap-4">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className="flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary group"
                                    >
                                        <Eye className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                                        <span className="font-semibold">ดู Class Labels</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                                    <DialogHeader className="sticky top-0 z-10 bg-background pb-2 border-b border-border">
                                        <DialogTitle className="flex items-center gap-2">
                                            <span className="material-symbols-rounded text-primary">format_list_bulleted</span>
                                            Class Labels
                                        </DialogTitle>
                                        <DialogDescription>
                                            รายการสายพันธุ์แมว 10 ชนิดที่โมเดลสามารถจำแนกได้
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-2 overflow-y-auto flex-1 pr-1">
                                        {builtInClassLabels.map((label, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                                            >
                                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium capitalize text-slate-700 dark:text-slate-200">
                                                    {label.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">อัปโหลดรูปภาพแมวที่ต้องการทำนาย</p>
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
                        onClick={handlePredict}
                        disabled={!selectedImage || !activeModel || isLoading}
                        className="w-full md:w-auto px-10 py-4 bg-primary text-white font-semibold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="material-symbols-rounded">analytics</span>}
                        {isLoading ? "กำลังทำนาย..." : "ทำนายเลย !"}
                    </button>
                </div>

                {/* RIGHT COLUMN: Preview & Results */}
                <div className="relative group">
                    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">

                        <div className={`relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${!selectedImage ? "aspect-[4/3]" : ""}`}>
                            {selectedImage ? (
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Cat Preview"
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
                                    <span className="material-symbols-rounded text-6xl">image</span>
                                    <p className="font-semibold tracking-widest uppercase text-xs">Waiting for Image</p>
                                </div>
                            )}
                        </div>

                        {predictions.length > 0 && !isLoading && (
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">ANALYSIS RESULTS</span>
                                </div>
                                <div className="space-y-4">
                                    {predictions.slice(0, 5).map((p, i) => {
                                        const barColors = ["bg-primary", "bg-blue-400", "bg-purple-400"];
                                        const percent = (p.probability * 100).toFixed(1);
                                        return (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    <span>{p.className}</span>
                                                    <span>{percent}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
