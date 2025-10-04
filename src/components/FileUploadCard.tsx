// 6. Upload Card UI
import { useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FileUploadCardProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  fileName?: string;
  icon?: React.ReactNode;
}

export const FileUploadCard = ({
  label,
  accept,
  onChange,
  fileName,
  icon,
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
          // ถ้า json เป็น array ของ string ให้ set classList ทันที
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

  return (
    <>
      <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              {icon || <Upload className="w-8 h-8 text-accent-foreground" />}
            </div>
            <div className="text-center">
              <Label htmlFor={label} className="text-lg font-semibold block mb-2">
                {label}
              </Label>
              {fileName && (
                <p className="text-sm text-muted-foreground mb-2">
                  {fileName}
                </p>
              )}
            </div>
            <Input
              id={label}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {jsonData && classList.length > 0 && (
              <Button variant="outline" className="mt-2" onClick={() => setShowPreview(true)}>
                Preview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Class Preview ({classList.length} items)</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-auto">
            {classList.length > 0 ? (
              <ul className="list-disc pl-5">
                {classList.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No class data found in file.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
