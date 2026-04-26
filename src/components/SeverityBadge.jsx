const config = {
  1: { label: 'Low',      bg: 'bg-green-100',  text: 'text-green-800' },
  2: { label: 'Moderate', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  3: { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-800' },
  4: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700'   },
  5: { label: 'EXTREME',  bg: 'bg-red-600',    text: 'text-white'     },
};

export default function SeverityBadge({ level }) {
  const s = config[level] || { label: 'Unknown', bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}