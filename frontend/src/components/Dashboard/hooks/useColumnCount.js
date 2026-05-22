import { useEffect, useState } from "react";

function getColumnCount(width) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1280) return 3;
  return 4;
}

export function useColumnCount() {
  const [columnCount, setColumnCount] = useState(() =>
    typeof window !== "undefined" ? getColumnCount(window.innerWidth) : 4,
  );

  useEffect(() => {
    const onResize = () => setColumnCount(getColumnCount(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return columnCount;
}

export function splitIntoColumns(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}
