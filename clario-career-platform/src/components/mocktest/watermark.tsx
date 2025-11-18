'use client';

import { useEffect, useState } from 'react';

interface WatermarkProps {
  careerPath?: string;
  sessionId: string;
}

export default function Watermark({ careerPath, sessionId }: WatermarkProps) {
  const watermarkText = careerPath || sessionId;

  return (
    <>
      {/* Background watermark pattern */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998] select-none overflow-hidden"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        {/* Diagonal repeating background watermark */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 150px,
                rgba(59, 130, 246, 0.03) 150px,
                rgba(59, 130, 246, 0.03) 151px
              ),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 150px,
                rgba(99, 102, 241, 0.03) 150px,
                rgba(99, 102, 241, 0.03) 151px
              )
            `,
          }}
        />
        
        {/* Large background text watermark - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-bold select-none"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              opacity: 0.08,
              transform: 'rotate(-45deg)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              letterSpacing: '0.5rem',
              color: 'rgba(59, 130, 246, 0.6)',
              textShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
            }}
          >
            {watermarkText}
          </div>
        </div>
        
        {/* Additional watermark instances for better coverage */}
        <div className="absolute top-1/4 left-1/4 flex items-center justify-center">
          <div
            className="font-bold select-none"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 4rem)',
              opacity: 0.06,
              transform: 'rotate(-45deg)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              letterSpacing: '0.3rem',
              color: 'rgba(99, 102, 241, 0.5)',
            }}
          >
            {watermarkText}
          </div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 flex items-center justify-center">
          <div
            className="font-bold select-none"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 4rem)',
              opacity: 0.06,
              transform: 'rotate(-45deg)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              letterSpacing: '0.3rem',
              color: 'rgba(59, 130, 246, 0.5)',
            }}
          >
            {watermarkText}
          </div>
        </div>
      </div>

      {/* Overlay text watermarks for additional security */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] select-none"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        {/* Grid of small watermarks */}
        {Array.from({ length: 24 }).map((_, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;
          const top = (row / 4) * 100 + 10;
          const left = (col / 6) * 100 + 8;
          const rotation = -45;
          
          return (
            <div
              key={index}
              className="absolute whitespace-nowrap font-semibold text-xs"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                opacity: 0.07,
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                color: 'rgba(59, 130, 246, 0.4)',
                fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
              }}
            >
              {watermarkText}
            </div>
          );
        })}
      </div>
    </>
  );
}