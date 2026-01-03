import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
    return (
        <div className={cn("max-w-4xl mx-auto px-6 w-full", className)} {...props}>
            {children}
        </div>
    );
}
