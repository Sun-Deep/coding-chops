import { ACCENT } from "../../shared/vertical/palette";

export const plateWidth = (disk: number) => 134 + disk * 40;

export const WeightPlateDefs: React.FC = () => (
  <>
    <linearGradient id="plate-side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#202328" />
      <stop offset="0.18" stopColor="#555A61" />
      <stop offset="0.5" stopColor="#777B81" />
      <stop offset="0.82" stopColor="#484C52" />
      <stop offset="1" stopColor="#1C1F23" />
    </linearGradient>
    <linearGradient id="plate-side-active" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8D3516" />
      <stop offset="0.2" stopColor={ACCENT} />
      <stop offset="0.5" stopColor="#FF9A61" />
      <stop offset="0.82" stopColor={ACCENT} />
      <stop offset="1" stopColor="#7A2C10" />
    </linearGradient>
    <radialGradient id="plate-face" cx="45%" cy="18%" r="78%">
      <stop offset="0" stopColor="#777B81" />
      <stop offset="0.52" stopColor="#4B4F55" />
      <stop offset="1" stopColor="#25282D" />
    </radialGradient>
    <radialGradient id="plate-face-active" cx="45%" cy="18%" r="78%">
      <stop offset="0" stopColor="#FFA16A" />
      <stop offset="0.52" stopColor={ACCENT} />
      <stop offset="1" stopColor="#A43B15" />
    </radialGradient>
    <linearGradient id="plate-hub" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F0EEE8" />
      <stop offset="0.28" stopColor="#9DA1A6" />
      <stop offset="0.68" stopColor="#4D5157" />
      <stop offset="1" stopColor="#D4D1C9" />
    </linearGradient>
  </>
);

export const WeightPlate: React.FC<{
  disk: number;
  x: number;
  y: number;
  active?: boolean;
  shadow?: number;
}> = ({ disk, x, y, active = false, shadow = 0.32 }) => {
  const width = plateWidth(disk);
  const face = active ? "url(#plate-face-active)" : "url(#plate-face)";
  const side = active ? "url(#plate-side-active)" : "url(#plate-side)";
  const rim = active ? "rgba(255,184,142,0.72)" : "rgba(226,224,216,0.34)";

  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse
        cx={9}
        cy={20}
        rx={width / 2 + 12}
        ry={17}
        fill={`rgba(0,0,0,${shadow})`}
      />

      <ellipse cx={0} cy={12} rx={width / 2} ry={17} fill="#17191D" />
      <rect x={-width / 2} y={-8} width={width} height={20} fill={side} />
      <ellipse cx={0} cy={-8} rx={width / 2} ry={18} fill={face} />

      <ellipse
        cx={0}
        cy={-8}
        rx={width / 2 - 7}
        ry={13}
        fill="none"
        stroke={rim}
        strokeWidth={5}
      />
      <ellipse
        cx={0}
        cy={-8}
        rx={Math.max(38, width / 2 - 34)}
        ry={8.5}
        fill="rgba(8,9,11,0.18)"
        stroke="rgba(8,9,11,0.24)"
        strokeWidth={2}
      />

      <ellipse cx={0} cy={-8} rx={25} ry={10.5} fill="url(#plate-hub)" />
      <ellipse
        cx={0}
        cy={-9}
        rx={18}
        ry={7.5}
        fill="#121417"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={2}
      />
      <path
        d={`M ${-width / 2 + 20} -14 Q 0 -28 ${width / 2 - 20} -14`}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
};
