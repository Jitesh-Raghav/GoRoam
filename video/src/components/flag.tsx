/** Japan's flag as a round badge, like the trip view's flag chip. */
export function Flag({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0, filter: "drop-shadow(0 6px 10px rgba(10,30,44,0.18))" }}>
      <circle cx={32} cy={32} r={31} fill="#fff" stroke="rgba(10,30,44,0.12)" strokeWidth={2} />
      <circle cx={32} cy={32} r={13} fill="#BC002D" />
    </svg>
  );
}
