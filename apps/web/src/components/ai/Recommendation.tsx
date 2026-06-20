import React from 'react';

export function Recommendation() {
  // Simple placeholder that will be replaced by API integration later.
  const items = [
    { id: 'a1', title: 'บรรยายเสริมทักษะการนำเสนอ' },
    { id: 'a2', title: 'กิจกรรมอาสาสมัครชุมชน' },
  ];

  return (
    <section className="mt-4">
      <h3 className="text-sm font-medium">แนะนำสำหรับคุณ</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((it) => (
          <li key={it.id} className="rounded-md border p-3 text-sm bg-white">
            {it.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Recommendation;
