// 1. react
import { useState } from "react";

// 2. ui components
import { Brain, FileJson, Image as ImageIcon, Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import kmutnb_logo from "../../public/logo.png"

// 9. app components
import { FileUploadCard } from "@/components/FileUploadCard";
import { PredictionResult } from "@/components/PredictionResult";
import Ourteam from "@/components/Ourteam";

// 14. onnxruntime-web
import {
  loadONNXModel,
  loadClassLabels,
  preprocessImage,
  runInference,
} from "@/utils/onnxInference";
import type { InferenceSession } from "onnxruntime-web";

// 3. type
interface Prediction {
  className: string;
  probability: number;
}

const Index = () => {

  // 4. State
  const { toast } = useToast();
  const [onnxFile, setOnnxFile] = useState<File | null>(null);
  const [classFile, setClassFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classLabels, setClassLabels] = useState<string[]>([]);

  // 15. session
  const [session, setSession] = useState<InferenceSession | null>(null);

  // 16. handleLoadModel
  const handleLoadModel = async () => {
    if (!onnxFile || !classFile) {
      toast({
        title: "ขาดไฟล์",
        description: "กรุณาอัพโหลด ONNX model และ class labels",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const loadedSession = await loadONNXModel(onnxFile);
      const labels = await loadClassLabels(classFile);
      setSession(loadedSession);
      setClassLabels(labels);
      toast({
        title: "โหลดโมเดลสำเร็จ",
        description: "พร้อมทำนายรูปภาพแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดโมเดลได้",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 17. handlePredict
  const handlePredict = async () => {
    if (!session || !classLabels.length) {
      toast({
        title: "โมเดลยังไม่พร้อม",
        description: "กรุณาโหลดโมเดลก่อน",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "ไม่มีรูปภาพ",
        description: "กรุณาอัพโหลดรูปภาพ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const inputTensor = await preprocessImage(imageFile);
      const results = await runInference(session, inputTensor, classLabels);
      setPredictions(results);
      toast({
        title: "ทำนายสำเร็จ",
        description: `พบ ${results[0].className} ด้วยความแม่นยำ ${(results[0].probability * 100).toFixed(2)}%`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถทำนายได้",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. return
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <img src={kmutnb_logo} className="mb-4 h-40 mx-auto" />
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Image Classification Platform with Fine-Tuned Pretrained Models (Squeenzenet)</h1>
          <p className="text-sm text-muted-foreground">
            Computer Vision Final Project (2025) - Department of Computer and Information Sciences, Faculty of Applied Science (KMUTNB)
          </p>
        </header>

        {/* Download Sample Data Section */}
        <div className="flex justify-center mb-8">
          <a
            href="https://drive.google.com/file/d/149qX66Ezn9l7TQThieyKSutqJXIfrFc9/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
                size="default"
                className="flex items-center gap-2"
                variant="outline"
              >
                <DownloadIcon className="w-5 h-5" />
                Download Example Data and Trained Model
              </Button>
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 10. Upload Cards */}
          <FileUploadCard
            label="ONNX Model"
            accept=".onnx"
            onChange={setOnnxFile}
            fileName={onnxFile?.name}
            icon={<Brain className="w-8 h-8 text-accent-foreground" />}
          />
          <FileUploadCard
            label="Class Labels (JSON)"
            accept=".json"
            onChange={setClassFile}
            fileName={classFile?.name}
            icon={<FileJson className="w-8 h-8 text-accent-foreground" />}
          />
          <FileUploadCard
            label="Image"
            accept="image/*"
            onChange={ file => {setImageFile(file); setPredictions([])}}
            fileName={imageFile?.name}
            icon={<ImageIcon className="w-8 h-8 text-accent-foreground" />}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            size="lg"
            // 18. Event onClick
            onClick={handleLoadModel}
            disabled={isLoading || !onnxFile || !classFile}
            className="min-w-[200px] flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            {/* 19. set button label */}
            {isLoading && !session ? "Loading..." : "Load Model"}
          </Button>
          <Button
            size="lg"
            // 20. Event onClick
            onClick={handlePredict}
            disabled={isLoading || !session || !imageFile}
            className="min-w-[200px] flex items-center gap-2"
          >
            <ImageIcon className="w-5 h-5" />
            {/* 21. Button Label */}
            {isLoading && session ? "Predicting..." : "Predict"}
          </Button>
        </div>

        {imageFile && (
          <div className="flex justify-center mb-8">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="max-w-md rounded-lg shadow-lg border-2 border-border"
            />
          </div>
        )}

        {predictions.length > 0 && (
          <div className="max-w-2xl mx-auto">
            {/* 11. Prediction Result */}
            <PredictionResult predictions={predictions} />
          </div>
        )}
      </div>

      {/* Our Team Section */}
      {/* 12. Our Team */}
      <Ourteam />

      <div className="text-center text-xs text-muted-foreground pb-4">Bethezank Lab 2025</div>
    </div>
  );
};

export default Index;
