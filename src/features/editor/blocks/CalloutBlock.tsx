import { createReactBlockSpec } from "@blocknote/react";
import { Info, AlertTriangle, Lightbulb, AlertCircle } from "lucide-react";

const calloutIcons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  error: AlertCircle,
} as const;

const calloutColors = {
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100",
  tip: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
  error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
} as const;

export const Callout = createReactBlockSpec(
  {
    type: "callout" as const,
    propSchema: {
      type: {
        default: "info" as const,
        values: ["info", "warning", "tip", "error"] as const,
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const type = props.block.props.type;
      const Icon = calloutIcons[type];
      const colorClass = calloutColors[type];

      return (
        <div className={`flex gap-3 rounded-lg border p-4 ${colorClass}`}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1 inline-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);
