import React from 'react';

interface PreRunCheckListProps {
    checks: {
        id: string;
        description: string;
        resolved: boolean;
    }[];
    onToggleCheck: (id: string, resolved: boolean) => void;
}

export const PreRunCheckList: React.FC<PreRunCheckListProps> = ({ checks, onToggleCheck }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pre-Run Checks</h3>
            <div className="bg-white dark:bg-gray-800 shadow rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                {checks.map((check) => (
                    <div key={check.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id={`check-${check.id}`}
                                type="checkbox"
                                checked={check.resolved}
                                onChange={(e) => onToggleCheck(check.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`check-${check.id}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {check.description}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
