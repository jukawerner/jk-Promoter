"use client";

import { MessageCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WhatsappButton() {
  return (
    <div className="fixed top-4 right-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://wa.me/5548992081047"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg transition-all hover:bg-green-600"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="left">
            <span>Entre em contato!</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
