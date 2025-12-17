import Link from 'next/link';

export default function Home() {
  const modules = [
    { href: '/payroll-config', label: 'Payroll Configuration', description: 'Manage payroll settings and policies' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
        <p className="text-muted-foreground">Choose a module to begin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="block p-6 bg-card rounded-lg shadow hover:shadow-md transition-shadow border border-border"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">{module.label}</h2>
            <p className="text-muted-foreground">{module.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
