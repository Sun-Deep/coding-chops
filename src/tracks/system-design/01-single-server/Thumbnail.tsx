import { Img, staticFile } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";

/**
 * The episode cover.
 *
 * The art is a generated base in `public/system-design/01-single-server`,
 * carrying the crowd, the request and the machine. The headline is set here
 * rather than baked into that image, so the copy stays under version control
 * and can be re-typeset, moved or corrected without regenerating anything.
 *
 * That split is the part worth keeping. Regenerating the base gives a different
 * picture every time; re-rendering this gives the same cover with the same type
 * in the same place, which is what a series needs.
 *
 * The headline is the whole promise. It names a number and puts the tension
 * outright, and the episode's answer is that the number on its own settles
 * nothing. It has to read at 168 by 94 in a phone feed, which is the size that
 * decides whether anything else here is ever seen.
 */
export const SingleServerThumbnail: React.FC = () => (
  <Canvas tone="paper" padding={0}>
    <Img
      src={staticFile("system-design/01-single-server/thumbnail-base.png")}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 54,
        top: 56,
        width: 740,
        fontFamily: theme.fontFamily,
        fontWeight: 800,
        letterSpacing: "-0.065em",
        color: theme.colors.ink,
      }}
    >
      <div style={{ fontSize: 100, lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ color: theme.colors.blue }}>10,000</span> users
      </div>
      <div
        style={{
          marginTop: 22,
          fontSize: 104,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        One server?
      </div>
    </div>
  </Canvas>
);
