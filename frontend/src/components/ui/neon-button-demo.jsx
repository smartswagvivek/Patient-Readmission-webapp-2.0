import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/neon-button";

const Default = () => {
  return (
    <div className="flex flex-col gap-3">
      <Button>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Button
        </span>
      </Button>
      <WithNoNeon />
      <Solid />
    </div>
  );
};

const WithNoNeon = () => {
  return (
    <div className="flex flex-col gap-2">
      <Button neon={false}>Normal button</Button>
    </div>
  );
};

const Solid = () => {
  return (
    <div className="flex flex-col gap-2">
      <Button variant="solid">Solid</Button>
    </div>
  );
};

export { Default, WithNoNeon, Solid };

