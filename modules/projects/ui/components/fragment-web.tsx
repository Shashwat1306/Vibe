import { Fragment } from "@prisma/client";
import { RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Hint } from "@/components/hint";

interface Props {
  data: Fragment;
}

export function FragmentWeb({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);

  const OnRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom" align="start">
          <Button size="sm" variant="outline" onClick={OnRefresh}>
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint text="Click to copy" side="bottom">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in a new tab" side="bottom" align="start">
          <Button
            size="sm"
            disabled={!data.sandboxUrl}
            variant="outline"
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, "_blank");
            }}
          ></Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        src={data.sandboxUrl}
        className="h-full w-full"
        loading="lazy"
        sandbox="allow-forms allow-scripts allow-same-origin"
      />
    </div>
  );
}
