export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-48 bg-slate-100 rounded-lg animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-1.5" />
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ))}
          <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
