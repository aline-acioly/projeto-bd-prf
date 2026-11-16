import { useState } from "react";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules";
import { useToast } from "@/hooks";
import { mensagemDeErro } from "@/services";

interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  /** Se lançar erro (ex.: 409 do banco), a mensagem vai para o toast e o diálogo fecha. */
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
}

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Excluir",
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const toast = useToast();
  const [processando, setProcessando] = useState(false);

  async function confirmar() {
    setProcessando(true);
    try {
      await onConfirmar();
    } catch (erro) {
      toast.erro(mensagemDeErro(erro));
      onCancelar();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={processando ? () => {} : onCancelar}>
      <p className="mb-6 text-sm text-gray-700">{mensagem}</p>
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar} disabled={processando}>
          Cancelar
        </Button>
        <Button variante="perigo" onClick={confirmar} disabled={processando}>
          {processando ? "Excluindo..." : textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
