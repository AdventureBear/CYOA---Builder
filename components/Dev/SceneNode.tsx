// components/SceneNode.tsx
import { NodeProps, Handle, Position } from 'reactflow';
import { FaBars } from 'react-icons/fa';
import React, { useState, useRef, useEffect } from 'react';

export default function SceneNode({ data }: NodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div style={{ background: 'white', border: '1px solid #ccc', padding: 8, position: 'relative', minHeight: 40 }}>
      {/* Handles for edges */}
      <Handle type="target" position={Position.Left} style={{ background: '#bbb', width: 10, height: 10, borderRadius: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#bbb', width: 10, height: 10, borderRadius: '50%' }} />
      {/* Hamburger menu button */}
      <button
        style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
        tabIndex={0}
        aria-label="Open menu"
      >
        <FaBars size={18} />
      </button>
      {/* Dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 28,
            right: 4,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 6,
            boxShadow: '0 2px 8px #0002',
            zIndex: 10,
            minWidth: 80,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
            }}
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(false);
              if (data.onEdit) data.onEdit();
            }}
          >
            Edit
          </button>
        </div>
      )}
      {/* Node label */}
      <div>{data.label}</div>
    </div>
  );
}