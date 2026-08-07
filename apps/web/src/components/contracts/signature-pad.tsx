"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSignatureChange?: (dataUrl: string | null) => void;
  width?: number;
  height?: number;
}

export function SignaturePad({
  onSignatureChange,
  width = 500,
  height = 180,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const strokeHistoryRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  const saveStrokeState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    strokeHistoryRef.current.push(
      ctx.getImageData(0, 0, canvas.width, canvas.height),
    );
  };

  const getCoordinates = (
    e:
      React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e:
      React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    saveStrokeState();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (
    e:
      React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && onSignatureChange) {
      onSignatureChange(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokeHistoryRef.current = [];
    setHasSignature(false);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  const undoStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (strokeHistoryRef.current.length > 0) {
      const lastState = strokeHistoryRef.current.pop()!;
      ctx.putImageData(lastState, 0, 0);
      const isEmpty = strokeHistoryRef.current.length === 0;
      setHasSignature(!isEmpty);
      if (onSignatureChange) {
        onSignatureChange(isEmpty ? null : canvas.toDataURL("image/png"));
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2.5">
      <div className="relative rounded-lg border border-zinc-300 bg-white shadow-inner p-1">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none rounded bg-white"
        />

        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-400">
            Sign here using mouse or touchscreen
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between px-1">
        <span className="text-[11px] text-zinc-500 font-medium">
          Digital Signature Pad — SHA-256 Encrypted
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undoStroke}
            disabled={!hasSignature}
            className="h-7 text-[11px] gap-1 text-zinc-700"
          >
            <RotateCcw className="size-3" /> Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            disabled={!hasSignature}
            className="h-7 text-[11px] gap-1 text-rose-600 hover:text-rose-700"
          >
            <Eraser className="size-3" /> Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
