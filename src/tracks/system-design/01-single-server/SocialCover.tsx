import { Img, staticFile } from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";

/**
 * Shared 9:16 cover for TikTok, Instagram Reels, and Facebook Reels.
 * The headline and server stay inside the centered 3:4 profile-grid crop.
 */
type SingleServerSocialCoverProps = {
  part?: 1 | 2 | 3 | 4;
};

export const SingleServerSocialCover: React.FC<
  SingleServerSocialCoverProps
> = ({ part }) => (
  <Canvas tone="paper" padding={0}>
    <Img
      src={staticFile("system-design/01-single-server/cover-base.png")}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />

    {part ? (
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 294,
          fontFamily: theme.fontFamily,
          fontSize: 58,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1,
          textAlign: "center",
          color: theme.colors.gray,
        }}
      >
        Part {String(part).padStart(2, "0")}
      </div>
    ) : null}

    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        top: part ? 390 : 294,
        fontFamily: theme.fontFamily,
        fontWeight: 800,
        letterSpacing: "-0.065em",
        textAlign: "center",
        color: theme.colors.ink,
      }}
    >
      <div style={{ fontSize: 122, lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ color: theme.colors.blue }}>10,000</span> users
      </div>
      <div
        style={{
          marginTop: 30,
          fontSize: 144,
          lineHeight: 0.94,
          whiteSpace: "nowrap",
        }}
      >
        One server?
      </div>
    </div>
  </Canvas>
);
