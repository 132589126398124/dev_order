export default function Loading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse mb-2" />
          <div className="h-7 w-32 bg-slate-100 rounded-xl animate-pulse mb-1.5" />
          <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-slate-100 rounded-full animate-pulse shrink-0" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <div className="flex-1 h-12 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="flex-1 h-12 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </main>
  );
}
