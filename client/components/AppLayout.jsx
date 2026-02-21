import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ title, subtitle, children, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pb-28">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="px-4 pb-6 pt-16 md:ml-72 md:px-8 md:pt-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-gray-300">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
        {children}
      </main>
    </div>
  );
}
