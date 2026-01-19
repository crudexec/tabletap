'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Link2, Check } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  tableNumber: number;
  companySlug: string;
}

export function TableQRCode({ tableNumber, companySlug }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const url = `${baseUrl}/${companySlug}/table/${tableNumber}`;

  const downloadQR = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 3;
      canvas.height = img.height * 3;
      ctx?.scale(3, 3);
      ctx?.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `table-${tableNumber}-qr.png`;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!baseUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background border border-border min-h-[200px]">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-background border border-border shadow-ive-sm hover:shadow-ive-md transition-ive">
      {/* Table Label */}
      <div className="w-full text-center mb-4">
        <span className="text-footnote text-muted-foreground">TABLE</span>
        <p className="text-[28px] font-semibold tracking-tight">{tableNumber}</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-3 rounded-xl shadow-ive-sm">
        <QRCodeSVG
          ref={svgRef}
          value={url}
          size={140}
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 w-full">
        <Button
          size="sm"
          variant="outline"
          onClick={copyLink}
          className={cn(
            'flex-1 h-9 rounded-xl text-[13px] transition-ive',
            copied && 'bg-[var(--status-success-muted)] border-[var(--status-success)]/30 text-[var(--status-success)]'
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={downloadQR}
          className="flex-1 h-9 rounded-xl text-[13px]"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Save
        </Button>
      </div>
    </div>
  );
}

interface QRCodeGridProps {
  tables: number[];
  companySlug: string;
}

export function QRCodeGrid({ tables, companySlug }: QRCodeGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-subhead text-muted-foreground mb-1">No tables configured</p>
        <p className="text-caption">Add tables in the Tables section to generate QR codes</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tables.map((tableNumber, index) => (
        <div
          key={tableNumber}
          className="animate-in fade-in zoom-in-95"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'backwards',
          }}
        >
          <TableQRCode tableNumber={tableNumber} companySlug={companySlug} />
        </div>
      ))}
    </div>
  );
}
