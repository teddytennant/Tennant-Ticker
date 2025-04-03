import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "default" | "small";
  className?: string;
  showBeta?: boolean;
  onClick?: () => void;
}

export function Logo({ variant = "default", className, showBeta = true, onClick }: LogoProps) {
  return (
    <Link 
      to="/" 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 select-none",
        className
      )}
    >
      <div 
        className={cn(
          "bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg",
          variant === "default" ? "w-8 h-8" : "w-6 h-6"
        )}
      >
        <span className={cn(
          "font-bold tracking-tight",
          variant === "default" ? "text-sm" : "text-xs"
        )}>
          TT
        </span>
      </div>
      
      {variant === "default" && (
        <div className="flex items-center gap-2">
          <span className="font-bold text-base whitespace-nowrap">Tennant Ticker</span>
          {showBeta && (
            <span className="pro-badge pro-badge-primary text-[10px] uppercase tracking-wider font-medium py-0.5">
              Beta
            </span>
          )}
        </div>
      )}
    </Link>
  );
} 