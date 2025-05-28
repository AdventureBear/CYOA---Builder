
import { useLogStore } from '@/store/logStore';

export function DiaryPanel() {
  const entries = useLogStore((s) => s.entries);

  return (
    <aside className="w-72 bg-black/70 text-amber-100 p-2 text-xs overflow-y-auto">
      {entries.map((e, i) => (
        <div key={i} className="mb-1">
          <span className="opacity-60 mr-1">
            {new Date(e.t).toLocaleTimeString()}
          </span>
          {e.kind === "action"   && <>Action <b>{e.id}</b></>}
          {e.kind === "outcome" && <>→ {e.description}</>}
        </div>
      ))}
    </aside>
  );
}