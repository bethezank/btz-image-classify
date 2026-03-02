import { Button } from "@/components/ui/button";
import { Brain, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BuiltInModelsProps {
    activeModel: string | null;
    onSelectModel: (modelName: string, onnxFile: File, classFile: File) => void;
}

export const BuiltInModels = ({ activeModel, onSelectModel }: BuiltInModelsProps) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSelect = async (modelName: string, modelUrl: string, classUrl: string) => {
        setIsLoading(modelName);
        try {
            const [modelRes, classRes] = await Promise.all([
                fetch(modelUrl),
                fetch(classUrl)
            ]);

            if (!modelRes.ok || !classRes.ok) {
                throw new Error("Failed to fetch model files");
            }

            const modelBlob = await modelRes.blob();
            const classBlob = await classRes.blob();

            const modelFile = new File([modelBlob], `${modelName}.onnx`, { type: "application/octet-stream" });
            const classFile = new File([classBlob], "classNames-cat.json", { type: "application/json" });

            onSelectModel(modelName, modelFile, classFile);
            // Removed toast from here since Index.tsx will handle it after auto-load
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ดาวน์โหลดโมเดลล้มเหลว",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-12 p-6 md:p-8 bg-card rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                    <Brain className="w-7 h-7 text-primary" />
                    ทดลองใช้งานโมเดล Build-in
                </h3>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                    เลือกโมเดลที่ถูกฝึกสอนมาแล้วด้านล่างเพื่อทดสอบระบบรวดเร็ว โดยระบบจะโหลดไฟล์ ONNX และ Class Labels ให้อัตโนมัติ
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                    variant={activeModel === "GoogleNet-cat" ? "default" : "secondary"}
                    size="lg"
                    onClick={() => handleSelect("GoogleNet-cat", "/models/trainedGoogleNet-cat.onnx", "/classes/classNames-cat.json")}
                    disabled={isLoading !== null}
                    className={`flex-1 max-w-sm flex items-center gap-2 h-14 text-base font-medium transition-colors ${activeModel === "GoogleNet-cat" ? "ring-2 ring-primary ring-offset-2" : "hover:bg-primary hover:text-primary-foreground"}`}
                >
                    {isLoading === "GoogleNet-cat" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Download className="w-5 h-5" />
                    )}
                    {isLoading === "GoogleNet-cat" ? "กำลังดาวน์โหลด..." : "ใช้โมเดล GoogleNet"}
                </Button>

                <Button
                    variant={activeModel === "SqueezeNet-cat" ? "default" : "secondary"}
                    size="lg"
                    onClick={() => handleSelect("SqueezeNet-cat", "/models/trainedSqueezeNet-cat.onnx", "/classes/classNames-cat.json")}
                    disabled={isLoading !== null}
                    className={`flex-1 max-w-sm flex items-center gap-2 h-14 text-base font-medium transition-colors ${activeModel === "SqueezeNet-cat" ? "ring-2 ring-primary ring-offset-2" : "hover:bg-primary hover:text-primary-foreground"}`}
                >
                    {isLoading === "SqueezeNet-cat" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Download className="w-5 h-5" />
                    )}
                    {isLoading === "SqueezeNet-cat" ? "กำลังดาวน์โหลด..." : "ใช้โมเดล SqueezeNet"}
                </Button>
            </div>
        </div>
    );
};
