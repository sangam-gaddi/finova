"use client";
import nextDynamic from 'next/dynamic';

const OSApp = nextDynamic(
  () => import('@/components/os/App').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontFamily: 'monospace' }}>Booting BEC VORTEX OS Kernel...</p>
      </div>
    ),
  }
);

export default function OSEntry() {
  return <OSApp />;
}
