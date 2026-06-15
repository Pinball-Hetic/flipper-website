"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onScan: (raw: string) => void;
  onError: () => void;
}

export default function QrScannerView({ onScan, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const id = "qr-" + Math.random().toString(36).slice(2);
    const container = containerRef.current;
    if (!container) return;
    container.id = id;

    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => onScan(text),
        () => {},
      )
      .catch(() => {
        setFailed(true);
        onError();
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) {
    return (
      <div className="mx-5 mb-2 rounded-xl border border-red-500/30 bg-red-950/50 px-4 py-3 text-center text-sm text-red-300">
        Caméra inaccessible
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden [&_video]:w-full [&_video]:object-cover [&_img]:hidden"
    />
  );
}
