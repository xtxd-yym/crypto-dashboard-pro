import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

interface SparklineChartProps {
  data: number[];
  color: string;
}

export const SparklineChart = ({ data, color }: SparklineChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 1. Initialize the chart if the ref exists
    if (chartRef.current) {
      // Initialize fast (renderer: 'canvas' is default)
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 2. Set options
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        confine: true,
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: {
          color: '#e2e8f0',
          fontSize: 10,
          fontFamily: 'Inter, sans-serif',
        },
        padding: [4, 8],
        /**
         * Refactoring Note:
         * TypeScript threw a mismatch error because `EChartsOption` defines formatter params as a Union type 
         * (Single Object | Array), but the implementation strictly expected an Array.
         * * I updated the signature to accept `CallbackDataParams | CallbackDataParams[]` to satisfy the interface.
         * * Inside, I added a normalization step (`Array.isArray`) to safely extract the data.
         * Benefit: Complies with strict type checks without using `any`, ensuring safety even if trigger type changes.
         */
        formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
          // Normalize: Ensure we handle both Array (axis trigger) and Object (item trigger)
          const firstItem = Array.isArray(params) ? params[0] : params;
          
          // Defensive coding: 'value' might be undefined or explicitly null in some edge cases
          const value = firstItem.value ?? 0; 
          
          return `$${Number(value).toLocaleString()}`;
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#94a3b8',
            width: 1,
            type: 'dashed',
          },
        },
      },
      grid: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 'dataMin',
        max: 'dataMax',
      },
      series: [
        {
          data: data,
          type: 'line',
          smooth: true,
          showSymbol: false,
          emphasis: {
            focus: 'series',
            itemStyle: {
              opacity: 1,
              borderWidth: 2,
              borderColor: '#fff',
            }
          },
          lineStyle: {
            width: 2,
            color: color,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color.replace(')', ', 0.2)').replace('rgb', 'rgba') },
              { offset: 1, color: 'transparent' },
            ]),
          },
        },
      ],
      animation: false, // Optional: Disable animation for instant rendering
    };

    chartInstance.current?.setOption(option);

    // 3. Robust Cleanup Function
    return () => {
      // This explicitly destroys the instance before the DOM node is removed
      // preventing the "disconnect" error.
      chartInstance.current?.dispose();
    };
  }, [data, color]); // Re-run if data or color changes

  if (!data || data.length === 0) {
    return <div className="h-12 flex items-center justify-center text-xs text-slate-600">No Data</div>;
  }

  return (
    // We render a plain div and let ECharts take over
    <div ref={chartRef} className="h-12 w-24" />
  );
};