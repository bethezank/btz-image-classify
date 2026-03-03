import { useState } from "react";
import { FileUploadCard } from "./FileUploadCard";
import { Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadONNXModel, loadClassLabels, preprocessImage, runInference } from "@/utils/onnxInference";
import type { InferenceSession } from "onnxruntime-web";
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLoadModel = async () => {
        if (!onnxFile || !classFile) {
            toast({
                title: "ไฟล์ไม่ครบถ้วน",
                description: "กรุณาอัปโหลดไฟล์ ONNX และ JSON",
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
                title: "โมเดลพร้อมใช้งาน",
                description: "โมเดลของคุณพร้อมสำหรับการทำนายแล้ว",
            });
        } catch (e) {
            toast({
                title: "โหลดโมเดลล้มเหลว",
                description: "ไม่สามารถเริ่มต้น ONNX session ได้",
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
                title: "โมเดลยังไม่พร้อม",
                description: "กรุณาโหลดโมเดลก่อน",
                variant: "destructive"
            });
            return;
        }
        if (!imageFile) {
            toast({
                title: "ไม่มีรูปภาพ",
                description: "กรุณาอัปโหลดรูปภาพเพื่อวิเคราะห์",
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
                title: "การวิเคราะห์ล้มเหลว",
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
                <h3 className="text-2xl font-semibold">
                    เลือกใช้โมเดล AI ของคุณเองได้ทันที
                </h3>
                <p className="text-muted-foreground text-base">
                    ถ้าคุณมีความสนใจในภาพประเภทอื่น สามารถเลือกใช้โมเดลของคุณเพื่อวิเคราะห์รูปภาพที่เป็นนามสกุล onnx และ class labels (json)
                </p>
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

                    {/* Section: Preview Labels */}
                    {classLabels.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">ดู Class Labels</p>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className="flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary group"
                                    >
                                        <Eye className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                                        <span className="font-semibold">ดู Class Labels</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                            <span className="material-symbols-rounded text-primary">format_list_bulleted</span>
                                            Class Labels
                                        </DialogTitle>
                                        <DialogDescription>
                                            รายการสายพันธุ์แมว {classLabels.length} ชนิดที่โมเดลสามารถจำแนกได้
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-2">
                                        {classLabels.map((label, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                                            >
                                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium capitalize">
                                                    {label.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleLoadModel}
                            disabled={isLoading || !onnxFile || !classFile}
                            className="flex-1 px-8 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            {isLoading && !hasSession ? "กำลังโหลด..." : "1. โหลดโมเดลเข้าระบบ"}
                        </button>
                        <button
                            onClick={handlePredict}
                            disabled={isLoading || !hasSession || !imageFile}
                            className="flex-1 px-8 py-4 rounded-2xl bg-primary text-white font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 disabled:hover:translate-y-0"
                        >
                            {isLoading && hasSession ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-rounded block">analytics</span>}
                            {isLoading && hasSession ? "กำลังทำนาย..." : "2. ทำนายเลย !"}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Preview & Results */}
                <div className="relative group">
                    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">

                        <div className={`relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${!imageFile ? "aspect-[4/3]" : ""}`}>
                            {imageFile ? (
                                <img
                                    src={URL.createObjectURL(imageFile)}
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
