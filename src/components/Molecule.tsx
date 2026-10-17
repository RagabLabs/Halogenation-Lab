import { formula } from "../data/species";
import type { Species } from "../engine/types";
export function Molecule({ species }: { species: Species }) {
  const carbon = ["CH4", "CH3Cl", "CH2Cl2", "CHCl3", "CCl4"].indexOf(species),
    di = carbon < 0;
  const positions = [
    [80, 20],
    [130, 70],
    [80, 120],
    [30, 70],
  ];
  return (
    <svg
      viewBox="0 0 160 140"
      className="molecule"
      role="img"
      aria-label={formula[species]}
    >
      {di ? (
        <>
          <line x1="48" y1="70" x2="112" y2="70" className="bond" />
          <text x="35" y="77" className={species === "Cl2" ? "atom-cl" : ""}>
            {species === "Cl2" ? "Cl" : "H"}
          </text>
          <text x="125" y="77" className="atom-cl">
            Cl
          </text>
        </>
      ) : (
        <>
          {positions.map(([x, y], i) => (
            <g key={i}>
              <line
                x1="80"
                y1="70"
                x2={80 + (x - 80) * 0.65}
                y2={70 + (y - 70) * 0.65}
                className="bond"
              />
              <text x={x} y={y + 7} className={i < carbon ? "atom-cl" : ""}>
                {i < carbon ? "Cl" : "H"}
              </text>
            </g>
          ))}
          <circle cx="80" cy="70" r="14" className="carbon" />
          <text x="80" y="77">
            C
          </text>
        </>
      )}
    </svg>
  );
}
