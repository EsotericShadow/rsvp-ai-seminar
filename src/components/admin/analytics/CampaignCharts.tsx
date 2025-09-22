'use client';

import { useEffect, useRef } from 'react';

interface ConversionFunnelChartProps {
  data: {
    emails: number;
    opens: number;
    clicks: number;
    rsvps: number;
  };
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate percentages
    const emailToOpen = (data.opens / data.emails) * 100;
    const openToClick = (data.clicks / data.opens) * 100;
    const clickToRsvp = (data.rsvps / data.clicks) * 100;

    // Colors
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];
    const labels = ['Emails', 'Opens', 'Clicks', 'RSVPs'];
    const values = [data.emails, data.opens, data.clicks, data.rsvps];
    const rates = [100, emailToOpen, openToClick, clickToRsvp];

    // Draw funnel bars
    const barWidth = 300;
    const barHeight = 40;
    const startX = (canvas.width - barWidth) / 2;
    const startY = 50;
    const spacing = 10;

    values.forEach((value, index) => {
      const y = startY + (index * (barHeight + spacing));
      const width = barWidth * (value / Math.max(...values));
      
      // Draw bar
      ctx.fillStyle = colors[index];
      ctx.fillRect(startX + (barWidth - width) / 2, y, width, barHeight);
      
      // Draw label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${labels[index]}: ${value.toLocaleString()} (${rates[index].toFixed(1)}%)`,
        canvas.width / 2,
        y + barHeight / 2 + 5
      );
    });

  }, [data]);

  return (
    <div className="text-center">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  );
}

interface ABTestChartProps {
  data: Array<{
    templateName: string;
    openRate: number;
    clickRate: number;
    rsvpRate: number;
  }>;
}

export function ABTestChart({ data }: ABTestChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    // Chart dimensions
    const margin = 60;
    const chartWidth = canvas.width - 2 * margin;
    const chartHeight = canvas.height - 2 * margin;
    const barWidth = chartWidth / (data.length * 3 + data.length + 1); // 3 bars per group + spacing

    // Colors
    const colors = ['#3B82F6', '#8B5CF6', '#10B981'];

    // Find max value for scaling
    const maxValue = Math.max(
      ...data.map(d => Math.max(d.openRate, d.clickRate, d.rsvpRate))
    );

    // Draw bars
    data.forEach((item, groupIndex) => {
      const groupStartX = margin + groupIndex * (chartWidth / data.length);
      const rates = [item.openRate, item.clickRate, item.rsvpRate];
      const labels = ['Open Rate', 'Click Rate', 'RSVP Rate'];

      rates.forEach((rate, barIndex) => {
        const x = groupStartX + barIndex * barWidth;
        const height = (rate / maxValue) * chartHeight;
        const y = margin + chartHeight - height;

        // Draw bar
        ctx.fillStyle = colors[barIndex];
        ctx.fillRect(x, y, barWidth * 0.8, height);

        // Draw value
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${rate.toFixed(1)}%`, x + barWidth * 0.4, y - 5);
      });
    });

    // Draw axes
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin + chartHeight);
    ctx.lineTo(margin + chartWidth, margin + chartHeight);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, margin + chartHeight);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    data.forEach((item, index) => {
      const x = margin + (index + 0.5) * (chartWidth / data.length);
      ctx.fillText(
        item.templateName.length > 10 
          ? item.templateName.substring(0, 10) + '...'
          : item.templateName,
        x,
        margin + chartHeight + 20
      );
    });

    // Draw legend
    const legendLabels = ['Open Rate', 'Click Rate', 'RSVP Rate'];
    legendLabels.forEach((label, index) => {
      const x = margin + index * 120;
      const y = 30;
      
      // Draw color box
      ctx.fillStyle = colors[index];
      ctx.fillRect(x, y - 10, 12, 12);
      
      // Draw label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 16, y);
    });

  }, [data]);

  return (
    <div className="text-center">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  );
}

interface PerformanceChartProps {
  data: {
    emails: number;
    opens: number;
    clicks: number;
    rsvps: number;
  };
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate percentages
    const openRate = (data.opens / data.emails) * 100;
    const clickRate = (data.clicks / data.emails) * 100;
    const rsvpRate = (data.rsvps / data.emails) * 100;

    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 40;

    const segments = [
      { label: 'Opens', value: openRate, color: '#3B82F6' },
      { label: 'Clicks', value: clickRate, color: '#8B5CF6' },
      { label: 'RSVPs', value: rsvpRate, color: '#10B981' },
      { label: 'No Action', value: 100 - openRate, color: '#6B7280' }
    ];

    let currentAngle = -Math.PI / 2; // Start at top

    segments.forEach((segment) => {
      const sliceAngle = (segment.value / 100) * 2 * Math.PI;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${segment.value.toFixed(1)}%`, labelX, labelY);
      ctx.fillText(segment.label, labelX, labelY + 15);

      currentAngle += sliceAngle;
    });

  }, [data]);

  return (
    <div className="text-center">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  );
}


