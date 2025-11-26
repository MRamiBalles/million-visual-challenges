import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const BrandDilutionDemo = () => {
  const [brandLock, setBrandLock] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="brand-lock"
          checked={brandLock}
          onCheckedChange={setBrandLock}
        />
        <Label htmlFor="brand-lock" className="text-lg font-semibold cursor-pointer">
          Brand Lock {brandLock ? "ON" : "OFF"}
        </Label>
      </div>

      <div className="relative h-[400px] overflow-hidden rounded-lg border-2 border-border">
        <motion.div
          className="absolute inset-0 p-8 bg-muted"
          animate={{ x: brandLock ? "-100%" : "0%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-full max-w-sm space-y-4">
              <div className="h-16 bg-secondary rounded" />
              <div className="h-32 bg-secondary rounded" />
              <div className="h-24 bg-secondary rounded" />
            </div>
            <p className="text-center text-muted-foreground font-medium">
              Generic Output<br />
              <span className="text-sm">No brand identity</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 p-8 bg-gradient-primary"
          animate={{ x: brandLock ? "0%" : "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-full max-w-sm space-y-4">
              <div className="h-16 bg-primary/20 rounded border-2 border-primary" />
              <div className="h-32 bg-primary/20 rounded border-2 border-primary" />
              <div className="h-24 bg-primary/20 rounded border-2 border-primary" />
            </div>
            <p className="text-center text-foreground font-medium">
              Brand-Aligned Output<br />
              <span className="text-sm text-primary">Consistent identity maintained</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
