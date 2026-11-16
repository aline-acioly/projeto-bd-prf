import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Adaptado do Tooltip do GFD: mesma lógica de abrir ao passar o mouse (com atraso para fechar),
// posição fixa sempre acima do gatilho e seta apontando para ele. Mudanças: cores por tokens,
// sem fundo escurecendo a página, conteúdo só como texto/JSX (sem HTML injetado), tamanhos
// menores para caber num formulário e abertura também pelo teclado (foco).

interface TooltipProps {
  content: ReactNode;
  position?: "left" | "center" | "right";
  /** Gatilho. Padrão: um "?" pequeno. */
  text?: ReactNode;
  width?: number;
  /** Largura em telas pequenas (px). */
  widthMobile?: number;
  /** Rótulo acessível do gatilho. */
  label?: string;
}

const MARGEM = 12;
const ALTURA_SETA = 8;
const ESPACO = 4;

export function Tooltip({
  content,
  position = "center",
  text,
  width = 280,
  widthMobile,
  label = "Ajuda",
}: TooltipProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const [arrowLeft, setArrowLeft] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abrir = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const fechar = () => {
    closeTimeoutRef.current = setTimeout(() => setIsVisible(false), 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const getResponsiveWidth = useCallback(() => {
    const vw = window.innerWidth;
    if (vw <= 425) return widthMobile ? Math.min(widthMobile, vw - 2 * MARGEM) : vw - 2 * MARGEM;
    return Math.min(width, vw - 2 * MARGEM);
  }, [width, widthMobile]);

  // Calcula a posição SEMPRE acima do gatilho, sem sair da tela.
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current || !isVisible) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = getResponsiveWidth();
    const viewportWidth = window.innerWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;

    let left: number;
    switch (position) {
      case "left":
        left = trigger.left;
        break;
      case "right":
        left = trigger.right - tooltipWidth;
        break;
      default:
        left = trigger.left + trigger.width / 2 - tooltipWidth / 2;
    }
    if (left < MARGEM) left = MARGEM;
    else if (left + tooltipWidth > viewportWidth - MARGEM) left = viewportWidth - tooltipWidth - MARGEM;

    let top = trigger.top - tooltipHeight - ALTURA_SETA - ESPACO;
    if (top < MARGEM) top = MARGEM;

    const centroDoGatilho = trigger.left + trigger.width / 2;
    setArrowLeft(Math.min(Math.max(centroDoGatilho - left, 12), tooltipWidth - 12));
    setTooltipPosition({ left, top });
  }, [isVisible, position, getResponsiveWidth]);

  useLayoutEffect(() => {
    if (isVisible) calculatePosition();
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;
    const recalcular = () => calculatePosition();
    window.addEventListener("resize", recalcular);
    window.addEventListener("scroll", recalcular, true);
    return () => {
      window.removeEventListener("resize", recalcular);
      window.removeEventListener("scroll", recalcular, true);
    };
  }, [isVisible, calculatePosition]);

  return (
    <span className="relative inline-flex" onMouseEnter={abrir} onMouseLeave={fechar}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-describedby={isVisible ? id : undefined}
        onFocus={abrir}
        onBlur={fechar}
        onKeyDown={(evento) => evento.key === "Escape" && setIsVisible(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary-500 text-[10px] font-semibold leading-none text-primary-700 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
      >
        {text ?? "?"}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          id={id}
          role="tooltip"
          className="fixed z-50"
          style={{ left: tooltipPosition.left, top: tooltipPosition.top, width: getResponsiveWidth() }}
          onMouseEnter={abrir}
          onMouseLeave={fechar}
        >
          <div className="rounded-md border border-primary-100 bg-primary-50 px-3 py-2 text-left text-xs font-normal leading-relaxed text-stone-800 shadow-sm">
            {content}
          </div>
          <svg
            width="16"
            height={ALTURA_SETA}
            viewBox="0 0 16 8"
            className="absolute -translate-x-1/2"
            style={{ left: arrowLeft, bottom: -ALTURA_SETA + 1 }}
            aria-hidden
          >
            <path d="M0 0 L8 8 L16 0 Z" className="fill-primary-50 stroke-primary-100" />
          </svg>
        </div>
      )}
    </span>
  );
}
