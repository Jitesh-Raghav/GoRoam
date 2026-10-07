// Shown inside the dashboard shell the moment a page is clicked, while it loads.
export default function Loading() {
  return (
    <div className="mx-auto max-w-[80rem]" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-3 w-28 rounded-full" />
      <div className="skeleton mt-5 h-14 w-full max-w-lg rounded-2xl" />
      <div className="skeleton mt-3 h-14 w-2/3 max-w-md rounded-2xl" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-[28px] bg-white ring-1 ring-line">
            <div className="skeleton h-48" />
            <div className="space-y-3 p-5">
              <div className="skeleton h-4 w-2/3 rounded-full" />
              <div className="skeleton h-4 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
