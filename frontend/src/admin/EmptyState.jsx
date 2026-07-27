import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Sin datos", description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 max-w-sm">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
