"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { StoreForm } from "./store-form";
import { StoreInventoryForm } from "./store-inventory-form";
import { PDVForm } from "./pdv-form";

interface StoreCardProps {
  store: {
    id: number;
    rede: string;
    loja: string;
    endereco: string;
  };
  onClick: () => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showPDVForm, setShowPDVForm] = useState(false);

  const handleCardClick = () => {
    setShowStoreForm(true);
  };

  const handleStoreFormNext = () => {
    setShowStoreForm(false);
    setShowInventoryForm(true);
  };

  const handleInventoryComplete = () => {
    setShowInventoryForm(false);
    setShowPDVForm(true);
  };

  const handlePDVComplete = () => {
    setShowPDVForm(false);
    onClick();
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all"
        onClick={handleCardClick}
      >
        <h2 className="text-xl font-bold text-gray-900">{store.rede}</h2>
        <h3 className="text-lg text-gray-700 mt-1">{store.loja}</h3>
        <div className="flex items-center gap-2 mt-4 text-gray-600">
          <MapPin className="h-4 w-4" />
          <p className="text-sm">{store.endereco}</p>
        </div>
      </motion.div>

      <StoreForm
        isOpen={showStoreForm}
        onClose={() => setShowStoreForm(false)}
        onNext={handleStoreFormNext}
      />

      <StoreInventoryForm
        isOpen={showInventoryForm}
        onClose={() => setShowInventoryForm(false)}
        onComplete={handleInventoryComplete}
      />

      <PDVForm
        isOpen={showPDVForm}
        onClose={() => setShowPDVForm(false)}
        onComplete={handlePDVComplete}
      />
    </>
  );
}