'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'framer-motion';
// ✅ FIX: Removed unused useEffect and useMemo imports
import React, { Children, cloneElement, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type VerticalDockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
};

export type VerticalDockProps = {
  items: VerticalDockItemData[];
  className?: string;
  distance?: number;
  panelWidth?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type VerticalDockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseY: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  label?: React.ReactNode;
  isActive?: boolean;
};

function VerticalDockItem({
  children,
  className = '',
  onClick,
  mouseY,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  isActive = false
}: VerticalDockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseY, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      y: 0,
      height: baseItemSize
    };
    return val - rect.y - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
    isHovered.set(1);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    isHovered.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center justify-center rounded-2xl cursor-pointer transition-colors duration-150 border-0 outline-none bg-transparent ${
        isActive
          ? 'font-bold scale-110 drop-shadow-sm opacity-100'
          : 'opacity-60 hover:opacity-100 hover:scale-105'
      } ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={typeof label === 'string' ? label : undefined}
    >
      {Children.map(children, child =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: boolean }>, { isHovered: hovered })
          : child
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: boolean;
};

function DockLabel({ children, className = '', isHovered = false }: DockLabelProps) {
  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.12 }}
          className={`${className} absolute left-full ml-3 top-1/2 -translate-y-1/2 w-fit whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-sans font-medium shadow-lg z-50 pointer-events-none`}
          style={{ backgroundColor: "var(--accent-solid)", color: "var(--accent-contrast)" }}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function VerticalDock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 58,
  distance = 140,
  panelWidth = 64,
  baseItemSize = 44
}: VerticalDockProps) {
  const mouseY = useMotionValue(Infinity);

  return (
    <aside
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center select-none ${className}`}
      aria-label="Application vertical dock"
    >
      <motion.div
        onMouseMove={({ pageY }) => {
          mouseY.set(pageY);
        }}
        onMouseLeave={() => {
          mouseY.set(Infinity);
        }}
        className="flex flex-col items-center gap-2.5 rounded-3xl p-2.5 backdrop-blur-2xl border-0 minimal-dock"
        style={{ width: panelWidth }}
        role="toolbar"
      >
        {/* Brand Logo without background color */}
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-2xl transition-transform hover:scale-110 cursor-pointer"
          title="Advotech Copilot"
        >
          <Image
            src="/logo.svg"
            alt="Advotech Copilot"
            width={34}
            height={34}
            className="w-8 h-8 object-contain dark:invert"
            priority
          />
        </Link>
        <div className="w-6 h-[1px] bg-[var(--text-primary)]/10 mb-0.5" />

        {items.map((item, index) => (
          <VerticalDockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseY={mouseY}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            isActive={item.isActive}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </VerticalDockItem>
        ))}
      </motion.div>
    </aside>
  );
}