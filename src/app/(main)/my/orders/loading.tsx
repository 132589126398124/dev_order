export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse mb-1.5" />
          <div className="h-4 w-12 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-9 w-20 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  );
}
