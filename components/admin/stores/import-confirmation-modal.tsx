import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Store {
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
  marcas: number[];
}

interface ImportConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: Store[];
}

export function ImportConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  data,
}: ImportConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Importação</DialogTitle>
          <DialogDescription>
            Revise os dados antes de confirmar a importação. Serão importadas{" "}
            {data.length} lojas.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rede</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((store, index) => (
                <TableRow key={index}>
                  <TableCell>{store.rede}</TableCell>
                  <TableCell>{store.loja}</TableCell>
                  <TableCell>{store.cnpj}</TableCell>
                  <TableCell>{store.cidade}</TableCell>
                  <TableCell>{store.uf}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.length > 5 && (
            <p className="text-sm text-gray-500 mt-2">
              ... e mais {data.length - 5} lojas
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Confirmar Importação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
