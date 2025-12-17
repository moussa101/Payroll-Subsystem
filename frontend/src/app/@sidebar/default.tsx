'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/payroll-tracking', label: 'Payroll History', icon: '🧾' },
    { href: '/payroll-config/policies', label: 'Policies', icon: '📋' },
    { href: '/payroll-config/pay-grades', label: 'Pay Grades', icon: '💰' },
    { href: '/payroll-config/pay-types', label: 'Pay Types', icon: '⏰' },
    { href: '/payroll-config/allowances', label: 'Allowances', icon: '🏠' },
    { href: '/payroll-config/tax-rules', label: 'Tax Rules', icon: '📊' },
    { href: '/payroll-config/insurance', label: 'Insurance', icon: '🛡️' },
    { href: '/payroll-config/signing-bonuses', label: 'Signing Bonuses', icon: '🎁' },
    { href: '/payroll-config/termination-benefits', label: 'Termination Benefits', icon: '👋' },
    { href: '/payroll-config/company-settings', label: 'Company Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Payroll System</h2>
        <p className="text-sm text-gray-500">Manage configurations</p>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
