import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
          <h4 className="font-bold text-lg mb-4">{label}</h4>

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
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setShowPreview(true)}>
              Preview Labels
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Class Preview ({classList.length} items)</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-auto text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            {classList.length > 0 ? (
              <ul className="list-decimal pl-5 space-y-1">
                {classList.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No class data found in file.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
