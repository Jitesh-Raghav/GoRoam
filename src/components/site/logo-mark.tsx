/** The GoRoam mark: a glossy globe circled by a gold flight orbit, a plane riding it. The same file is the favicon and app icon. */
export function LogoMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icon.svg" alt="" aria-hidden width={512} height={512} className={className} />;
}
