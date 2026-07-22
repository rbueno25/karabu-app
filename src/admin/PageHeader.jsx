import React from "react";

export default function PageHeader({ title, description, action, testId }) {
  return (
    <div data-testid={testId || "page-header"} className="flex items-start justify-between gap-6 mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
