import { useEffect, useState } from "react";
import "./App.css";

const GRID = 12;
const TILE = 48;
const SPEED = 0.15;

type Vec = { x : number; y: number};

function heuristic(a: Vec, b: Vec)
{
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function findPath(start: Vec, end: Vec)
{
  const open: Vec[ ] = [start];
  const cameFrom = new Map<string, Vec>();
  const g = new Map <string, number>();
  g.set(`${start.x}, ${start.y}`, 0);

  while (open.length)
  {
    open.sort(
      (a, b) =>
        g.get(`${a.x}, ${a.y}`)! + heuristic(a, end) -
        (g.get(`${b.x}, ${b.y}`)! + heuristic(b, end))
    );

    const current = open.shift()!;
    if (current.x === end.x && current.y === end.y)
    {
      const path = [];
      let c: Vec | undefined = current;
      while (c) {
        path.unshift(c);
        c = cameFrom.get(`${c.x}, ${c.y}`);
      }
      return path;
    }
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    for (const d of dirs) {
      const nx = current.x + d.x;
      const ny = current.y + d.y;
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;

      const key = `${nx}, ${ny}`;
      const newG = g.get(`${current.x}, ${current.y}`)! + 1;

      if (!g.has(key) || newG < g.get(key)!) 
      {
        g.set(key, newG);
        cameFrom.set(key, current);
        open.push({ x : nx, y: ny });
      }
    }
  }
}

export default function App() {
  const [pos, setPos] = useState({ x: 0, y: 0});
  const [target, setTarget] = useState<Vec | null>(null);
  const [path, setPath] = useState<Vec[]>([]);
  const [items, setItems] = useState<Vec[]>([
    { x: 4, y: 2 },
    { x: 7, y: 6 },
    { x: 10, y: 3 },
  ]);

  useEffect(() => {
    if (!path.length) return;

    const id = setInterval(() => 
    {
      setPos(p => {
        const next = path[0];
        const dx = next.x - p.x;
        const dy = next.y - p.y;

        if (Math.abs(dx) < SPEED && Math.abs(dy) < SPEED)
        {
          setPath(p => p.slice(1));
          return next;
        }
        return { x: p.x + Math.sign(dx) * SPEED, y: p.y + Math.sign(dy) * SPEED };
      });
    }, 16);
    return () => clearInterval(id);
  }, [path]);

  useEffect(() => 
  {
    setItems(items =>
      items.filter(
        i => Math.floor(pos.x) !== i.x || Math.floor(pos.y) !== i.y
      )
    );
  }, [pos]);

  function clickTile(x: number, y: number) {
    setTarget({ x, y });
    const p = findPath(
      { x: Math.floor(pos.x), y: Math.floor(pos.y) },
      { x, y }
    );
    if (p) setPath(p.slice(1));
  }

  return (
    <div className="board">
      {Array.from({ length: GRID }).map((_, y) =>
        Array.from({ length: GRID }).map((_, x) => (
          <div
            key={`${x},${y}`}
            className="tile"
            onClick={() => clickTile(x, y)}
          /> 
        ))
      )}

      {/* Items */}
      {items.map((item, i) => (
        <div
          key={`item-${i}-${item.x}-${item.y}`}
          className="item"
          style={{
            left: item.x * TILE,
            top: item.y * TILE,
          }}
        />
      ))}

      {/* Player */}
      <div
        className="player"
        style={{
          left: pos.x * TILE,
          top: pos.y * TILE,
        }}
      />
    </div>
  );
}
