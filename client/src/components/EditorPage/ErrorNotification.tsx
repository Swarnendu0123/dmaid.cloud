// components/ErrorNotification.jsx
import { AlertCircle, X } from "lucide-react";

const ErrorNotification = ({
  error,
  clearError,
}: {
  error: { type: string; message: string };
  clearError: () => void;
}) => {
  if (!error.type) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
        <div className="flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error.message}</p>
          </div>
          <button
            onClick={clearError}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
