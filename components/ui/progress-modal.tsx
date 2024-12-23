"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ProgressModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  progress: number;
}

export function ProgressModal({
  isOpen,
  title,
  description,
  progress,
}: ProgressModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || "Processando..."}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
