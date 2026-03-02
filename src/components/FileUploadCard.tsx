import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface FileUploadCardProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  fileName?: string;
  iconName: string;
  colorClass: string; // e.g. "blue", "purple", "pink"
}

export const FileUploadCard = ({
  label,
  accept,
  onChange,
  fileName,
  iconName,
  colorClass,
}: FileUploadCardProps) => {
  const [jsonData, setJsonData] = useState<unknown>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [classList, setClassList] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setJsonData(json);
          if (Array.isArray(json) && json.every(item => typeof item === "string")) {
            setClassList(json);
          } else {
            setClassList([]);
          }
        } catch {
          setJsonData(null);
          setClassList([]);
        }
      };
      reader.readAsText(file);
    } else {
      setJsonData(null);
      setClassList([]);
    }
  };

  const colorStyles: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-500",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-500"
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all text-center space-y-6 flex flex-col justify-between">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${colorStyles[colorClass] || colorStyles.blue}`}>
          <span className="material-symbols-rounded text-3xl">{iconName}</span>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <h4 className="font-semibold text-lg mb-4">{label}</h4>

          <div className="relative group">
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs ${fileName ? 'text-primary' : 'text-slate-400'} flex justify-between items-center group-hover:bg-slate-100 transition-colors`}>
              <span className="font-semibold whitespace-nowrap">Choose File</span>
              <span className="truncate ml-2">{fileName || "No file chosen"}</span>
            </div>
          </div>

          {jsonData && classList.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full flex items-center gap-2 rounded-full" 
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4" />
              ดู Class Labels
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="material-symbols-rounded text-primary">format_list_bulleted</span>
              Class Labels
            </DialogTitle>
            <DialogDescription>
              รายการสายพันธุ์แมว {classList.length} ชนิดที่โมเดลสามารถจำแนกได้
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {classList.map((label, index) => (
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
    </>
  );
};
