
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
    isNegative?: boolean;
    isLoading?: boolean;
}

export default function StatCard({ title, value, icon, description, isNegative = false, isLoading = false }: StatCardProps) {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {isLoading ? <Skeleton className="h-4 w-24" /> : title}
                </CardTitle>
                {!isLoading && icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : value}
                </div>
                {description && (
                    <div className={`text-xs text-muted-foreground ${isNegative ? 'text-destructive' : ''}`}>
                        {isLoading ? <Skeleton className="h-3 w-32 mt-1" /> : description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
