export function spawnFloat(ref: React.RefObject<HTMLElement>, value: number, type: "damage" | "buff") {
  if (!ref.current)
	return;
  
  const rect = ref.current.getBoundingClientRect();
  const color = type === "damage" ? "text-red-400" : "text-sky-300";
  const label = type === "damage" ? `-${value}` : `+${value}`;

  const el = document.createElement("div");
  el.className = `fixed z-50 pointer-events-none font-bold text-xl ${color} animate-fb-float-up`;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top}px`;
  el.style.transform = "translateX(-50%)";
  el.textContent = label;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}