'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { hexToHsl, hslToHex, getRecommendedColors, HarmonyType } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorWheelProps {
    colors: string[];
    onColorsChange: (colors: string[]) => void;
}

type SelectionMode = 'free' | 'recommended';

export function ColorWheel({ colors, onColorsChange }: ColorWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<SelectionMode>('free');
    const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType>('complementary');
    const [selectedColor1, setSelectedColor1] = useState<string>(colors[0] || '#5135FF');
    const [selectedColor2, setSelectedColor2] = useState<string>(colors[1] || '#FF5828');
    const [isDragging1, setIsDragging1] = useState(false);
    const [isDragging2, setIsDragging2] = useState(false);
    const wheelRadius = 120;
    const centerX = 140;
    const centerY = 140;

    useEffect(() => {
        drawColorWheel();
    });

    const drawColorWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const radius = wheelRadius;

        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 0.5) * Math.PI / 180;
            const endAngle = (angle + 0.5) * Math.PI / 180;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `hsl(${angle}, 100%, 100%)`);
            gradient.addColorStop(0.5, `hsl(${angle}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 30%)`);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }, []);

    const getColorFromPosition = (x: number, y: number): string | null => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > wheelRadius) {
            return null;
        }

        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        angle = (angle + 360) % 360;
        const saturation = Math.min(100, (distance / wheelRadius) * 100);
        const lightness = 50;

        return hslToHex(angle, saturation, lightness);
    };

    const getPositionFromColor = (color: string) => {
        const hsl = hexToHsl(color);
        const angle = hsl.h * Math.PI / 180;
        const distance = (hsl.s / 100) * wheelRadius;
        return {
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pos1 = getPositionFromColor(selectedColor1);
        const pos2 = getPositionFromColor(selectedColor2);

        const dist1 = Math.sqrt((x - pos1.x) ** 2 + (y - pos1.y) ** 2);
        const dist2 = Math.sqrt((x - pos2.x) ** 2 + (y - pos2.y) ** 2);

        const color = getColorFromPosition(x, y);
        if (!color) return;

        if (dist1 < 20 || (dist1 <= dist2)) {
            setIsDragging1(true);
            setSelectedColor1(color);
            updateColors(color, mode === 'recommended' ? (getRecommendedColors(color, selectedHarmony)[0] || selectedColor2) : selectedColor2);
        } else {
            setIsDragging2(true);
            setSelectedColor2(color);
            updateColors(selectedColor1, color);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging1 && !isDragging2) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const color = getColorFromPosition(x, y);

        if (color) {
            if (isDragging1) {
                setSelectedColor1(color);
                if (mode === 'recommended') {
                    const recommended = getRecommendedColors(color, selectedHarmony);
                    if (recommended.length > 0) {
                        setSelectedColor2(recommended[0]);
                    }
                }
                updateColors(color, mode === 'recommended' ? (getRecommendedColors(color, selectedHarmony)[0] || selectedColor2) : selectedColor2);
            } else if (isDragging2) {
                setSelectedColor2(color);
                updateColors(selectedColor1, color);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging1(false);
        setIsDragging2(false);
    };

    const updateColors = (color1: string, color2: string) => {
        const newColors = [...colors];
        newColors[0] = color1;
        if (newColors.length > 1) {
            newColors[1] = color2;
        } else {
            newColors.push(color2);
        }
        onColorsChange(newColors);
    };

    const handleRecommendedColorSelect = (color: string) => {
        setSelectedColor2(color);
        updateColors(selectedColor1, color);
    };

    const pos1 = getPositionFromColor(selectedColor1);
    const pos2 = getPositionFromColor(selectedColor2);

    const recommendedColors = mode === 'recommended' ? getRecommendedColors(selectedColor1, selectedHarmony) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Mode:</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={mode === 'free' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('free')}
                        className="text-sm"
                    >
                        Free
                    </Button>
                    <Button
                        variant={mode === 'recommended' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('recommended')}
                        className="text-sm"
                    >
                        Recommended
                    </Button>
                </div>
            </div>

            {mode === 'recommended' && (
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">Harmony:</span>
                    <div className="flex gap-2 flex-wrap">
                        {(['complementary', 'analogous', 'triadic', 'split-complementary', 'monochromatic'] as HarmonyType[]).map((harmony) => (
                            <Button
                                key={harmony}
                                variant={selectedHarmony === harmony ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setSelectedHarmony(harmony);
                                    const recommended = getRecommendedColors(selectedColor1, harmony);
                                    if (recommended.length > 0) {
                                        setSelectedColor2(recommended[0]);
                                        updateColors(selectedColor1, recommended[0]);
                                    }
                                }}
                                className="text-xs"
                            >
                                {harmony.charAt(0).toUpperCase() + harmony.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={280}
                        height={280}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="cursor-crosshair rounded-full shadow-lg border-2 border-border"
                        style={{ width: 280, height: 280 }}
                    />
                    <div
                        className={cn(
                            "absolute w-8 h-8 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none transition-all",
                            isDragging1 ? "ring-2 ring-primary ring-offset-2" : ""
                        )}
                        style={{
                            left: pos1.x,
                            top: pos1.y,
                            backgroundColor: selectedColor1
                        }}
                    />
                    <div
                        className={cn(
                            "absolute w-8 h-8 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none transition-all",
                            isDragging2 ? "ring-2 ring-primary ring-offset-2" : ""
                        )}
                        style={{
                            left: pos2.x,
                            top: pos2.y,
                            backgroundColor: selectedColor2
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl border-2 border-border shadow-sm"
                        style={{ backgroundColor: selectedColor1 }}
                    />
                    <span className="font-mono text-sm">{selectedColor1.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl border-2 border-border shadow-sm"
                        style={{ backgroundColor: selectedColor2 }}
                    />
                    <span className="font-mono text-sm">{selectedColor2.toUpperCase()}</span>
                </div>
            </div>

            {mode === 'recommended' && recommendedColors.length > 0 && (
                <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Recommended colors:</div>
                    <div className="flex gap-3 flex-wrap">
                        {recommendedColors.map((color, index) => (
                            <button
                                key={index}
                                onClick={() => handleRecommendedColorSelect(color)}
                                className={cn(
                                    "w-12 h-12 rounded-xl border-2 shadow-sm transition-all hover:scale-110",
                                    color === selectedColor2 ? "border-primary ring-2 ring-primary/50" : "border-border"
                                )}
                                style={{ backgroundColor: color }}
                                title={color.toUpperCase()}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
