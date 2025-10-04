// 7. Prediction Result
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Prediction {
  className: string;
  probability: number;
}

interface PredictionResultProps {
  predictions: Prediction[];
}

export const PredictionResult = ({ predictions }: PredictionResultProps) => {
  if (predictions.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">ผลการทำนาย</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.map((pred, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">{pred.className}</span>
              <span className="text-sm text-muted-foreground">
                {(pred.probability * 100).toFixed(2)}%
              </span>
            </div>
            <Progress value={pred.probability * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
