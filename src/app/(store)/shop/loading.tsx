export default function ShopLoading() {
  return (
    <div
      className="container-rk flex flex-col gap-5 py-8 sm:py-10"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <div className="skeleton h-9 w-40" />
      <div className="skeleton h-11 w-full max-w-xs" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-24 !rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-square w-full !rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-8 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
