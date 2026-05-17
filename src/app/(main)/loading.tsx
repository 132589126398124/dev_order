export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="h-8 w-40 bg-slate-100 rounded-xl animate-pulse mb-2" />
      <div className="h-4 w-56 bg-slate-100 rounded-lg animate-pulse mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="h-4 w-28 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
