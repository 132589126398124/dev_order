export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse mb-2" />
          <div className="h-4 w-20 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="h-3 w-14 bg-slate-100 rounded animate-pulse mb-3" />
            <div className="h-7 w-10 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      <div className="h-10 bg-slate-100 rounded-xl animate-pulse mb-4" />

      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-14 bg-slate-100 rounded-full animate-pulse" />
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-7 w-16 bg-slate-100 rounded-full animate-pulse" />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="h-11 bg-slate-50 border-b border-slate-100" />
        {[1, 2, 3, 4, 5, 6, 8, 9, 10].map((i) => (
          <div key={i} className="h-14 border-b border-slate-50 px-4 flex items-center gap-4 last:border-0">
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 flex-1 bg-slate-100 rounded animate-pulse" />
            <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
