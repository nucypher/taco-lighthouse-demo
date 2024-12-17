import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ErrorDisplayProps {
  error: {
    message: string;
    stack?: string;
    [key: string]: any;
  };
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  const errorText = JSON.stringify(error, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(errorText);
      toast.success("Error details copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle className="flex items-center justify-between">
        Error
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-destructive/50 hover:bg-destructive/10"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </AlertTitle>
      <AlertDescription>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-2">
          <pre className="text-xs font-mono whitespace-pre-wrap break-words">
            {errorText}
          </pre>
        </ScrollArea>
      </AlertDescription>
    </Alert>
  );
}