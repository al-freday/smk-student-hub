
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
    isNegative?: boolean;
}

export default function StatCard({ title, value, icon, description, isNegative = false }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs text-muted-foreground ${isNegative ? 'text-destructive' : ''}`}>
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
