'use client';

import { useState } from 'react';
import { 
  hexToRgb, 
  rgbToHex, 
  hexToHsl, 
  hslToHex,
  getComplementaryColor,
  getAnalogousColors,
  getTriadicColors,
  getSplitComplementaryColors,
  getMonochromaticColors,
  getRecommendedColors,
  HarmonyType
} from '@/lib/utils';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export function ColorTests() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = () => {
    setRunning(true);
    const results: TestResult[] = [];
    const testColor = '#5135FF';

    results.push({
      name: 'hexToRgb - Basic conversion',
      passed: true,
      message: `Converted ${testColor} to ${JSON.stringify(hexToRgb(testColor))}`
    });

    const rgb = hexToRgb(testColor);
    const hexBack = rgbToHex(rgb.r, rgb.g, rgb.b);
    results.push({
      name: 'rgbToHex - Round trip',
      passed: hexBack.toLowerCase() === testColor.toLowerCase(),
      message: `Round trip: ${testColor} -> rgb -> ${hexBack}`
    });

    const hsl = hexToHsl(testColor);
    const hexFromHsl = hslToHex(hsl.h, hsl.s, hsl.l);
    results.push({
      name: 'hexToHsl + hslToHex - Round trip',
      passed: true,
      message: `HSL round trip: ${testColor} -> HSL(${hsl.h.toFixed(1)}, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%) -> ${hexFromHsl}`
    });

    const complementary = getComplementaryColor(testColor);
    results.push({
      name: 'getComplementaryColor',
      passed: complementary.length === 7 && complementary.startsWith('#'),
      message: `Complementary of ${testColor} is ${complementary}`
    });

    const analogous = getAnalogousColors(testColor);
    results.push({
      name: 'getAnalogousColors',
      passed: analogous.length === 2,
      message: `Found ${analogous.length} analogous colors: ${analogous.join(', ')}`
    });

    const triadic = getTriadicColors(testColor);
    results.push({
      name: 'getTriadicColors',
      passed: triadic.length === 2,
      message: `Found ${triadic.length} triadic colors: ${triadic.join(', ')}`
    });

    const splitComplementary = getSplitComplementaryColors(testColor);
    results.push({
      name: 'getSplitComplementaryColors',
      passed: splitComplementary.length === 2,
      message: `Found ${splitComplementary.length} split-complementary colors: ${splitComplementary.join(', ')}`
    });

    const monochromatic = getMonochromaticColors(testColor);
    results.push({
      name: 'getMonochromaticColors',
      passed: monochromatic.length >= 2,
      message: `Found ${monochromatic.length} monochromatic colors: ${monochromatic.join(', ')}`
    });

    const harmonies: HarmonyType[] = ['complementary', 'analogous', 'triadic', 'split-complementary', 'monochromatic'];
    harmonies.forEach(harmony => {
      const recommended = getRecommendedColors(testColor, harmony);
      results.push({
        name: `getRecommendedColors - ${harmony}`,
        passed: recommended.length > 0,
        message: `${harmony}: ${recommended.join(', ')}`
      });
    });

    setTestResults(results);
    setRunning(false);
  };

  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="p-6 space-y-4 bg-card rounded-xl border border-border">
      <h2 className="text-xl font-bold text-foreground">Color Algorithm Tests</h2>
      
      <button 
        onClick={runTests}
        disabled={running}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {running ? 'Running...' : 'Run Tests'}
      </button>

      {testResults.length > 0 && (
        <>
          <div className="text-lg font-medium">
            Results: {passedCount}/{totalCount} passed
          </div>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="font-medium flex items-center gap-2">
                  <span className={result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {result.passed ? '✓' : '✗'}
                  </span>
                  {result.name}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.message}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Visual Test</h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Test Color:</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: '#5135FF' }} />
              <span className="font-mono">#5135FF</span>
            </div>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Complementary:</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: getComplementaryColor('#5135FF') }} />
              <span className="font-mono">{getComplementaryColor('#5135FF')}</span>
            </div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Analogous:</span>
            <div className="flex items-center gap-3 mt-1">
              {getAnalogousColors('#5135FF').map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border border-border" style={{ backgroundColor: color }} />
                  <span className="font-mono text-sm">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
