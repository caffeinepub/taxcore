import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Pencil } from "lucide-react";
import { useRef, useState } from "react";

interface StatusOption {
  label: string;
  value: string;
  colorClass: string;
}

interface InlineStatusCellProps {
  value: string;
  options: StatusOption[];
  onSave: (newValue: string) => void;
  disabled?: boolean;
}

export default function InlineStatusCell({
  value,
  options,
  onSave,
  disabled = false,
}: InlineStatusCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentOption = options.find((o) => o.value === value);
  const colorClass = currentOption?.colorClass ?? "bg-gray-100 text-gray-500";

  const handleSelect = (newValue: string) => {
    if (newValue === value || disabled) return;
    onSave(newValue);
    // Trigger glow animation
    setIsGlowing(true);
    if (glowTimer.current) clearTimeout(glowTimer.current);
    glowTimer.current = setTimeout(() => {
      setIsGlowing(false);
    }, 1200);
  };

  if (disabled) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {value || "-"}
      </span>
    );
  }

  return (
    <div
      ref={cellRef}
      className="inline-flex items-center gap-1 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: "box-shadow 0.2s ease",
        borderRadius: "6px",
        ...(isGlowing
          ? {
              boxShadow:
                "0 0 0 2px #16a34a, 0 0 10px 2px rgba(22, 163, 74, 0.35)",
              animation: "cellGlow 1.2s ease-out forwards",
            }
          : {}),
      }}
    >
      <style>{`
        @keyframes cellGlow {
          0% { box-shadow: 0 0 0 2px #16a34a, 0 0 10px 2px rgba(22, 163, 74, 0.4); }
          60% { box-shadow: 0 0 0 2px #16a34a, 0 0 12px 4px rgba(22, 163, 74, 0.25); }
          100% { box-shadow: 0 0 0 0px transparent; }
        }
      `}</style>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 group/badge focus:outline-none focus:ring-0"
            title="Click to change status"
            style={{
              border: isHovered ? "1px solid #c9a44c" : "1px solid transparent",
              borderRadius: "20px",
              padding: "1px 2px 1px 1px",
              transition: "border-color 0.15s ease",
              background: "transparent",
            }}
          >
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
            >
              {value || "-"}
            </span>
            <Pencil
              className="w-3 h-3 flex-shrink-0 transition-opacity duration-150"
              style={{
                color: "#c9a44c",
                opacity: isHovered ? 1 : 0,
              }}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[130px] p-1">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="flex items-center gap-2 text-xs px-2 py-1.5 cursor-pointer rounded"
            >
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${opt.colorClass}`}
              >
                {opt.label}
              </span>
              {opt.value === value && (
                <Check className="w-3 h-3 ml-auto text-emerald-600 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
