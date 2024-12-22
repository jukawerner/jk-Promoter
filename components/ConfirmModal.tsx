import { Dialog, DialogContent } from "components/ui/dialog"; // Importação correta
import { Button } from "components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  barcode: string;
  brand: string;
  product: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, barcode, brand, product }: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <h2>Confirmação de Leitura</h2>
        <p>Código de Barras: {barcode}</p>
        <p>Marca: {brand}</p>
        <p>Produto: {product}</p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
