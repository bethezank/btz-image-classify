import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { HeroCard } from "@/components/HeroCard";
import { CustomModelCard } from "@/components/CustomModelCard";
import Ourteam from "@/components/Ourteam";
import { loadONNXModel, loadClassLabels, preprocessImage, runInference } from "@/utils/onnxInference";
import type { InferenceSession } from "onnxruntime-web";

interface Prediction {
  className: string;
  probability: number;
}

const Index = () => {
  const { toast } = useToast();

  // State for Manual Upload
  const [onnxFile, setOnnxFile] = useState<File | null>(null);
  const [classFile, setClassFile] = useState<File | null>(null);
  const [manualImageFile, setManualImageFile] = useState<File | null>(null);

  // App State
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classLabels, setClassLabels] = useState<string[]>([]);
  const [activeBuiltInModel, setActiveBuiltInModel] = useState<string | null>(null);
  const [session, setSession] = useState<InferenceSession | null>(null);

  const performLoad = async (model: File, labels: File) => {
    setIsLoading(true);
    setPredictions([]);
    try {
      const loadedSession = await loadONNXModel(model);
      const loadedLabels = await loadClassLabels(labels);
      setSession(loadedSession);
      setClassLabels(loadedLabels);
      toast({
        title: "Model Initialized",
        description: "System is ready for server-side inference simulation.",
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

  const handleBuiltInLoad = async (name: string, model: File, labels: File) => {
    setActiveBuiltInModel(name);
    await performLoad(model, labels);
  };

  const handleManualLoad = async () => {
    if (!onnxFile || !classFile) {
      toast({ title: "Missing Files", description: "Please upload ONNX and JSON files.", variant: "destructive" });
      return;
    }
    setActiveBuiltInModel(null);
    await performLoad(onnxFile, classFile);
  };

  const handlePredict = async (file?: File) => {
    const targetFile = file || manualImageFile;
    if (!session || !classLabels.length) {
      toast({ title: "Model Not Ready", description: "Please load a model first.", variant: "destructive" });
      return;
    }
    if (!targetFile) {
      toast({ title: "Missing Image", description: "Please upload an image to analyze.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const inputTensor = await preprocessImage(targetFile, 224);
      const results = await runInference(session, inputTensor, classLabels);
      setPredictions(results);
    } catch (error) {
      toast({ title: "Analysis Failed", variant: "destructive" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-[-2] lab-bg opacity-40" />

      {/* Mascot Layer */}
      <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none">
        <img
          src="/cat-classify_transparent.webp"
          alt="Mascot"
          className="w-[500px] h-auto object-contain mascot-float opacity-30"
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-[0]">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          <HeroCard
            activeModel={activeBuiltInModel}
            onSelectModel={handleBuiltInLoad}
            onPredict={async (file) => {
              await handlePredict(file);
            }}
            predictions={activeBuiltInModel !== null ? predictions : []}
            isLoading={isLoading && activeBuiltInModel !== null}
          />

          <CustomModelCard
            onnxFile={onnxFile}
            classFile={classFile}
            imageFile={manualImageFile}
            setOnnxFile={setOnnxFile}
            setClassFile={setClassFile}
            setImageFile={setManualImageFile}
            onLoadModel={handleManualLoad}
            onPredict={() => handlePredict()}
            isLoading={isLoading && activeBuiltInModel === null}
            hasSession={!!session}
            predictions={activeBuiltInModel === null ? predictions : []}
          />

          <Ourteam />
        </main>

        <footer className="mt-20 py-12 px-6 glass-card border-t border-white/20 dark:border-white/10 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              CAT BREED CLASSIFIER PLATFORM &copy; 2026
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-loose max-w-sm mx-auto">
              Educational project for AI System Integration. Department of<br />
              Computer and Information Sciences, KMUTNB.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
