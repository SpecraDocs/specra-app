import { createReactBlockSpec } from "@blocknote/react";

export const Steps = createReactBlockSpec(
  {
    type: "steps" as const,
    propSchema: {
      stepNumber: {
        default: "1",
      },
      title: {
        default: "Step",
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const number = props.block.props.stepNumber;
      const title = props.block.props.title;

      return (
        <div className="flex gap-4 border-l-2 border-primary pb-6 pl-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {number}
          </div>
          <div className="flex-1">
            <div className="mb-2 font-semibold text-foreground">{title}</div>
            <div className="inline-content" ref={props.contentRef} />
          </div>
        </div>
      );
    },
  }
);
