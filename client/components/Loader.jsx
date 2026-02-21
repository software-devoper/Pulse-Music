export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-300">
        <span className="h-3 w-3 animate-pulse rounded-full bg-rose-400" />
        <span>{label}</span>
      </div>
    </div>
  );
}
