import React, { useRef, useState } from 'react';

/**
 * A lightweight, zero-dependency virtual table for high-performance scroll windowing.
 */
const VirtualTable = ({ data, columns, itemHeight = 64, containerHeight = 400 }) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = data.length * itemHeight;
  
  // Calculate index window boundaries
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const endIndex = Math.min(data.length - 1, Math.floor((scrollTop + containerHeight) / itemHeight) + 3);

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (data[i]) {
      visibleItems.push({ index: i, item: data[i] });
    }
  }

  return (
    <div className="flex flex-col border border-gray-800/60 dark:border-gray-800/60 bg-gray-950/40 rounded-2xl overflow-hidden shadow-inner">
      {/* Header */}
      <div className="flex bg-[#0e1322] text-xs font-bold text-gray-400 uppercase border-b border-gray-850 px-6 py-4">
        {columns.map((col, cIdx) => (
          <div
            key={cIdx}
            style={{ width: col.width || 'auto', flexGrow: col.width ? 0 : 1 }}
            className="text-left select-none tracking-wider"
          >
            {col.header}
          </div>
        ))}
      </div>
      
      {/* Scrolling body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto relative scrollbar-thin scrollbar-track-gray-950 scrollbar-thumb-gray-800"
        style={{ height: `${containerHeight}px` }}
      >
        <div style={{ height: `${totalHeight}px`, width: '100%' }}>
          {visibleItems.map(({ index, item }) => (
            <div
              key={item.id || index}
              style={{
                position: 'absolute',
                top: `${index * itemHeight}px`,
                height: `${itemHeight}px`,
                width: '100%'
              }}
              className="flex items-center hover:bg-gray-800/10 dark:hover:bg-gray-800/20 border-b border-gray-900 px-6 py-2 transition-colors"
            >
              {columns.map((col, cIdx) => (
                <div
                  key={cIdx}
                  style={{ width: col.width || 'auto', flexGrow: col.width ? 0 : 1 }}
                  className="truncate"
                >
                  {col.render ? col.render(item) : <span className="text-sm text-gray-300">{item[col.key]}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {data.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm py-12">
            No prediction logs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTable;
