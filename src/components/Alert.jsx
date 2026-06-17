import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
export function Alert({ message, type }) {
  return (
    <div className="px-2 py-3 flex flex-row iterms-center bg-red-100/50 text-red-700 rounded-lg w-full mb-3" role="alert">
      <ExclamationCircleIcon className="w-4 h-4 mr-2" />
      <span className="text-xs">
        {message}</span>
    </div>
  )

}
