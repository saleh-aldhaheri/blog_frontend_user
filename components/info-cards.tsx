
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
type Info = {
  title: string;
  value: number;
  description: string;
};

function InfoCards({ title, value, description }: Info) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-5">{value}</div>
        <p className="text-xs text-green-500">{description}</p>
      </CardContent>
    </Card>
  );
}

export default InfoCards;
