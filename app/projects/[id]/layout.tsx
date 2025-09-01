import { mockProjects } from '../../lib/mock-data';

// Generate static params for the dynamic route
export async function generateStaticParams() {
    return mockProjects.map(project => ({
        id: project.id.toString(),
    }));
}

// Layout component for the dynamic project route
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    return children;
}
