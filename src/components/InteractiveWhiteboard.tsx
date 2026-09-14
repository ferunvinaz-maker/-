import React, { useRef, useState, useEffect } from 'react';
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  Minus, 
  ArrowRight, 
  Square, 
  Circle, 
  Grid, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Sparkles,
  Maximize2,
  Minimize2,
  Type,
  Plus
} from 'lucide-react';

interface InteractiveWhiteboardProps {
  initialText?: string;
  onClearInitialText?: () => void;
}

type Tool = 'pen' | 'highlighter' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'axes' | 'text';
type BackgroundType = 'chalkboard' | 'whiteboard' | 'grid-dark' | 'grid-light';

export const InteractiveWhiteboard: React.FC<InteractiveWhiteboardProps> = ({
  initialText,
  onClearInitialText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('#ffffff');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [bgType, setBgType] = useState<BackgroundType>('chalkboard');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Drawing state
  const isDrawing = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);

  // History stack for Undo/Redo
  const history = useRef<ImageData[]>([]);
  const historyStep = useRef<number>(-1);

  // Science symbols
  const scienceSymbols = [
    'Δ', 'λ', 'θ', 'π', 'Ω', 'μ', 'α', 'β', 'γ', 'v', 
    '→', '⇌', '℃', 'm/s²', 'mol/L', 'F=ma', 'W=F.d', 'E=mc²', 'pH', 'H₂O'
  ];

  // Helper: Get color based on bgType default
  useEffect(() => {
    if (bgType === 'whiteboard' || bgType === 'grid-light') {
      if (color === '#ffffff') setColor('#0f172a');
    } else {
      if (color === '#0f172a') setColor('#ffffff');
    }
  }, [bgType]);

  // Set up canvas with ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;

        // Save current canvas content before resize
        const ctx = canvas.getContext('2d');
        let tempImage: ImageData | null = null;
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          try {
            tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch (e) {
            // ignore
          }
        }

        canvas.width = width;
        canvas.height = Math.max(540, height);

        // Re-render background
        drawBackground();

        // Restore content if existed
        if (tempImage && ctx) {
          ctx.putImageData(tempImage, 0, 0);
        } else {
          saveState();
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [bgType]);

  // Draw background (chalkboard green, grid, whiteboard)
  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (bgType === 'chalkboard') {
      // Classic deep green chalkboard
      ctx.fillStyle = '#16382c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'whiteboard') {
      // Clean modern white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'grid-dark') {
      // Dark chalkboard with coordinate grid
      ctx.fillStyle = '#12231c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e3f32';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else if (bgType === 'grid-light') {
      // Graph paper / Millimeter paper
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // Push state to history
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyStep.current += 1;
      history.current = history.current.slice(0, historyStep.current);
      history.current.push(data);
      if (history.current.length > 25) {
        history.current.shift();
        historyStep.current -= 1;
      }
    } catch (e) {
      console.warn('Canvas saveState failed', e);
    }
  };

  const undo = () => {
    if (historyStep.current > 0) {
      historyStep.current -= 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history.current[historyStep.current]) {
        ctx.putImageData(history.current[historyStep.current], 0, 0);
      }
    }
  };

  const redo = () => {
    if (historyStep.current < history.current.length - 1) {
      historyStep.current += 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history.current[historyStep.current]) {
        ctx.putImageData(history.current[historyStep.current], 0, 0);
      }
    }
  };

  const clearCanvas = () => {
    drawBackground();
    saveState();
  };

  // Stamp initial text or formula
  useEffect(() => {
    if (initialText && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.font = 'bold 16px "Tajawal", sans-serif';
      ctx.fillStyle = bgType === 'whiteboard' || bgType === 'grid-light' ? '#0f172a' : '#fef08a';
      
      const maxWidth = canvas.width - 80;
      const lines: string[] = [];
      let currentLine = '';
      const words = initialText.split(' ');

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Render boxed text at top
      ctx.fillStyle = bgType === 'whiteboard' || bgType === 'grid-light' ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 30, 24, 0.9)';
      ctx.fillRect(30, 30, canvas.width - 60, Math.min(180, lines.length * 24 + 30));
      ctx.strokeStyle = bgType === 'whiteboard' || bgType === 'grid-light' ? '#cbd5e1' : '#22543d';
      ctx.strokeRect(30, 30, canvas.width - 60, Math.min(180, lines.length * 24 + 30));

      ctx.fillStyle = bgType === 'whiteboard' || bgType === 'grid-light' ? '#0f172a' : '#fef08a';
      lines.slice(0, 6).forEach((line, i) => {
        ctx.fillText(line, 45, 60 + i * 24);
      });

      ctx.restore();
      saveState();
      onClearInitialText?.();
    }
  }, [initialText]);

  // Mouse / Touch coordinates
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    isDrawing.current = true;
    startPos.current = coords;

    try {
      snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      // ignore
    }

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 4;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
      ctx.globalAlpha = 0.35;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      const eraserColor = bgType === 'chalkboard' 
        ? '#16382c' 
        : bgType === 'grid-dark' 
        ? '#12231c' 
        : bgType === 'grid-light' 
        ? '#f8fafc' 
        : '#ffffff';
      ctx.strokeStyle = eraserColor;
      ctx.lineWidth = lineWidth * 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // Shape tools: restore previous snapshot then draw ghost preview
      if (snapshot.current) {
        ctx.putImageData(snapshot.current, 0, 0);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        drawArrow(ctx, startPos.current.x, startPos.current.y, coords.x, coords.y);
      } else if (tool === 'rect') {
        const w = coords.x - startPos.current.x;
        const h = coords.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      } else if (tool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.current.x, coords.y - startPos.current.y);
        ctx.beginPath();
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'axes') {
        // Coordinate axes with X and Y arrows
        drawAxes(ctx, startPos.current.x, startPos.current.y, coords.x, coords.y);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.globalAlpha = 1.0;
    }
    saveState();
  };

  // Draw arrow helper for vectors
  const drawArrow = (ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) => {
    const headlen = 14;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  // Draw Cartesian coordinate axes
  const drawAxes = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    // Horizontal axis X
    drawArrow(ctx, x1, y2, x2, y2);
    // Vertical axis Y
    drawArrow(ctx, x1, y2, x1, y1);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText('x', x2 - 10, y2 + 20);
    ctx.fillText('y', x1 - 20, y1 + 15);
    ctx.fillText('O', x1 - 15, y2 + 15);
  };

  // Stamp scientific symbol onto canvas center
  const stampSymbol = (symbol: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    // Place near top-center
    ctx.fillText(symbol, canvas.width / 2 - 30, 100);
    ctx.restore();
    saveState();
  };

  // Download whiteboard as PNG
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `بلوم-للعلوم-سبورة-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const colors = [
    { label: 'أبيض', value: '#ffffff' },
    { label: 'أصفر', value: '#facc15' },
    { label: 'سماوي', value: '#38bdf8' },
    { label: 'أخضر فوسفوري', value: '#4ade80' },
    { label: 'برتقالي', value: '#fb923c' },
    { label: 'وردي', value: '#f472b6' },
    { label: 'أسود داكن', value: '#0f172a' },
  ];

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-2 z-50 shadow-2xl' : 'h-[740px]'
      }`}
    >
      
      {/* Whiteboard Top Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        
        {/* Left: Tools & Shapes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          <button
            type="button"
            onClick={() => setTool('pen')}
            title="قلم الرسم الحر"
            className={`p-2 rounded-xl transition-all ${
              tool === 'pen' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Pen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('highlighter')}
            title="محدد فوسفوري شفاف"
            className={`p-2 rounded-xl transition-all ${
              tool === 'highlighter' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            title="ممحاة"
            className={`p-2 rounded-xl transition-all ${
              tool === 'eraser' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Geometric & Vector Shapes */}
          <button
            type="button"
            onClick={() => setTool('line')}
            title="خط مستقيم"
            className={`p-2 rounded-xl transition-all ${
              tool === 'line' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('arrow')}
            title="سهم المتجهات (القوى والسرعات)"
            className={`p-2 rounded-xl transition-all ${
              tool === 'arrow' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('rect')}
            title="مستطيل"
            className={`p-2 rounded-xl transition-all ${
              tool === 'rect' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('circle')}
            title="دائرة / مسار دائري"
            className={`p-2 rounded-xl transition-all ${
              tool === 'circle' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool('axes')}
            title="محاور إحداثية بيانية (X-Y)"
            className={`p-2 rounded-xl transition-all ${
              tool === 'axes' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="font-mono text-xs font-bold px-0.5">XY</span>
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Background selector */}
          <select
            value={bgType}
            onChange={(e) => {
              setBgType(e.target.value as BackgroundType);
            }}
            className="bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="chalkboard">سبورة خضراء 📗</option>
            <option value="grid-dark">شبكة بيانية داكنة 📐</option>
            <option value="grid-light">ورق رسم بياني أبيض 📊</option>
            <option value="whiteboard">سبورة بيضاء 📄</option>
          </select>

        </div>

        {/* Right: Actions, Stroke size, Fullscreen */}
        <div className="flex items-center gap-2">
          
          {/* Stroke Width Slider */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-xl">
            <span className="text-[11px] text-slate-400 font-bold">السمك:</span>
            <input
              type="range"
              min="1"
              max="16"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 accent-emerald-500 h-1 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-emerald-400 w-4">{lineWidth}</span>
          </div>

          {/* Color swatches */}
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                title={c.label}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  color === c.value ? 'scale-125 ring-2 ring-emerald-400 border-white' : 'border-slate-600 hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={undo}
            title="تراجع"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <RotateCcw className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={redo}
            title="إعادة"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <RotateCw className="w-4 h-4 rtl:rotate-180" />
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={clearCanvas}
            title="مسح السبورة بالكامل"
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Export PNG */}
          <button
            type="button"
            onClick={downloadCanvas}
            title="تحميل الرسم كصورة PNG"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">حفظ</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'تصغير' : 'تكبير ملء الشاشة'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Science Quick Symbols Bar */}
      <div className="bg-slate-800/95 text-slate-300 px-4 py-1.5 border-b border-slate-700/80 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">إدراج رموز ومعادلات سريعة:</span>
        {scienceSymbols.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => stampSymbol(sym)}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200 font-mono text-xs transition-colors shrink-0 font-semibold"
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-900 cursor-crosshair select-none touch-none">
        <canvas
          id="science-interactive-whiteboard"
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 w-full h-full block"
        />
      </div>

    </div>
  );
};
