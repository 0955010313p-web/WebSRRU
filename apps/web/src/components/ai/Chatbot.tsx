"use client";
import React, { useState } from 'react';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-2 w-80 rounded-lg bg-white p-3 shadow-lg">
          <div className="text-sm text-[var(--srru-muted)]">Chat prototype (placeholder)</div>
        </div>
      )}
      <button
        className="rounded-full bg-[var(--srru-green)] px-4 py-2 text-white shadow-md"
        onClick={() => setOpen((s) => !s)}
      >
        {open ? 'ปิด' : 'ช่วยเหลือ'}
      </button>
    </div>
  );
}

export default Chatbot;
