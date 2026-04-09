import '@/components/os/os-utilities.css';
import '@/components/os/os-styles.css'; // Load OS-specific styles only on this page
import OSEntry from '@/components/os/OSEntry';

export const metadata = {
    title: 'BEC VORTEX OS',
    description: 'High-fidelity OS hacking simulator',
};

export default function OSPage() {
    return (
        <main className="w-screen h-screen overflow-hidden bg-black text-white m-0 p-0">
            <OSEntry />
        </main>
    );
}
