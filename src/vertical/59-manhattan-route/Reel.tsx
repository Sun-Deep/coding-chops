import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { Sfx } from "../../shared/primitives/Sfx";
import { clamp } from "../../shared/video/timing";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import * as B from "./beats";
import { CUES } from "./cues";
import { ROUTE_KM } from "./measurements";
import { narration } from "./narration";
import { COUNTERS_TOP, Stage } from "./Stage";

export const ManhattanRouteReel: React.FC<{ still?: string }> = ({ still }) => {
  const frame = useCurrentFrame();
  const conditions = interpolate(
    frame,
    [B.VERDICT, B.VERDICT + 10],
    [0, 1],
    clamp,
  );
  return (
    <VerticalShell>
      <AbsoluteFill style={{ background: theme.colors.black }} />
      <Stage frame={frame} still={still} />
      <Headline top={236} size={84}>
        Harlem to Wall St.
      </Headline>
      <div
        style={{
          position: "absolute",
          top: COUNTERS_TOP + 140,
          left: 96,
          width: 888,
          fontFamily: theme.monoFamily,
          fontSize: 19,
          color: theme.colors.grayDark,
          opacity: conditions,
        }}
      >
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: "rgba(5,5,6,0.88)",
          }}
        >
          OpenStreetMap, 3 Nov 2026 · {ROUTE_KM} km by bike, one-ways kept
        </span>
      </div>
      <Narration lines={narration} />
      {CUES.map((cue) => (
        <Sfx
          key={cue.id}
          name={cue.name}
          at={cue.frame}
          gain={cue.gain}
          playbackRate={cue.rate}
        />
      ))}
    </VerticalShell>
  );
};
