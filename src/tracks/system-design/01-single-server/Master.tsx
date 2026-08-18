import type { ReactNode } from "react";
import {
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../../../shared/brand/theme";
import { Canvas } from "../../../shared/primitives/Canvas";
import { clamp, seconds } from "../../../shared/video/timing";

const easeOut = {
  ...clamp,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

const SceneCaption: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: 260,
      right: 260,
      bottom: 42,
      color: theme.colors.ink,
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-0.015em",
      lineHeight: 1.28,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const Cursor: React.FC<{ size: number; opacity?: number }> = ({
  size,
  opacity = 1,
}) => (
  <span
    style={{
      display: "inline-block",
      width: Math.max(6, size * 0.055),
      height: size * 0.9,
      marginLeft: size * 0.1,
      borderRadius: 8,
      backgroundColor: theme.colors.blue,
      opacity,
      verticalAlign: "-0.1em",
    }}
  />
);

const TapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const buyIn = interpolate(frame, [5, 20], [0, 1], easeOut);
  const tapScale = interpolate(frame, [20, 28, 38], [1, 0.94, 1], easeOut);

  return (
    <Canvas tone="paper">
      <div
        style={{
          position: "absolute",
          left: 180,
          right: 180,
          top: 365,
          color: theme.colors.ink,
          fontSize: 112,
          fontWeight: 600,
          letterSpacing: "-0.06em",
          lineHeight: 1.05,
        }}
      >
        You tap{" "}
        <span
          style={{
            display: "inline-block",
            color: theme.colors.blue,
            opacity: buyIn,
            transform: `translateY(${interpolate(buyIn, [0, 1], [24, 0], easeOut)}px) scale(${tapScale})`,
          }}
        >
          Buy.
        </span>
      </div>
      <SceneCaption>
        One small action starts a journey across the system.
      </SceneCaption>
    </Canvas>
  );
};

const RequestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sentence = "Your browser sends a";
  const typedCount = Math.max(
    0,
    Math.min(
      sentence.length,
      Math.floor(interpolate(frame, [0, 55], [0, sentence.length], clamp)),
    ),
  );
  const requestIn = interpolate(frame, [58, 74], [0, 1], easeOut);
  const blink = Math.floor(frame / 12) % 2 === 0 ? 1 : 0;

  return (
    <Canvas tone="paper">
      <div
        style={{
          position: "absolute",
          left: 180,
          right: 180,
          top: 350,
          color: theme.colors.ink,
          fontSize: 106,
          fontWeight: 600,
          letterSpacing: "-0.055em",
          lineHeight: 1.08,
        }}
      >
        {sentence.slice(0, typedCount)}
        {typedCount < sentence.length ? (
          <Cursor size={106} opacity={blink} />
        ) : (
          <>
            {" "}
            <span
              style={{
                display: "inline-block",
                color: theme.colors.blue,
                opacity: requestIn,
                transform: `translateY(${interpolate(requestIn, [0, 1], [24, 0], easeOut)}px)`,
              }}
            >
              request.
            </span>
            <Cursor size={106} opacity={frame > 82 ? blink : 0} />
          </>
        )}
      </div>
      <SceneCaption>
        A request says what you want the application to do.
      </SceneCaption>
    </Canvas>
  );
};

const ServerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const arrival = interpolate(frame, [0, 70], [0, 1], easeOut);
  const response = interpolate(frame, [82, 106], [0, 1], easeOut);

  return (
    <Canvas tone="paper">
      <div
        style={{
          position: "absolute",
          left: 180,
          right: 180,
          top: 235,
          color: theme.colors.ink,
          fontSize: 96,
          fontWeight: 600,
          letterSpacing: "-0.055em",
          lineHeight: 1.08,
          textAlign: "center",
        }}
      >
        The request reaches
        <br />
        <span style={{ color: theme.colors.blue }}>one server.</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 260,
          right: 260,
          top: 620,
          height: 8,
          borderRadius: 8,
          background: theme.colors.grayLight,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${arrival * 100}%`,
            top: "50%",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: theme.colors.blue,
            boxShadow: "0 8px 24px rgba(23,105,224,0.24)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 260,
          top: 655,
          color: theme.colors.gray,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Browser
      </div>
      <div
        style={{
          position: "absolute",
          right: 260,
          top: 655,
          color: response > 0 ? theme.colors.blue : theme.colors.gray,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Server
      </div>
      <SceneCaption>
        The server runs the application logic for that request.
      </SceneCaption>
    </Canvas>
  );
};

const DatabaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame, [0, 22], [0, 1], easeOut);
  const dataIn = interpolate(frame, [46, 68], [0, 1], easeOut);

  return (
    <Canvas tone="paper">
      {[
        "Does this user exist?",
        "Is this item in stock?",
        "What is the price?",
      ].map((question, index) => (
        <div
          key={question}
          style={{
            position: "absolute",
            left: 180,
            top: 150 + index * 250,
            color: index === 1 ? theme.colors.ink : theme.colors.grayLight,
            fontSize: index === 1 ? 86 : 58,
            fontWeight: index === 1 ? 700 : 600,
            letterSpacing: "-0.05em",
            opacity: index === 1 ? focus : 0.32,
            transform:
              index === 1
                ? `translateX(${interpolate(focus, [0, 1], [40, 0], easeOut)}px)`
                : undefined,
          }}
        >
          {question}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          right: 180,
          bottom: 210,
          color: theme.colors.blue,
          fontSize: 82,
          fontWeight: 700,
          letterSpacing: "-0.055em",
          opacity: dataIn,
          transform: `translateY(${interpolate(dataIn, [0, 1], [24, 0], easeOut)}px)`,
        }}
      >
        The database answers.
      </div>
      <SceneCaption>
        The database stores the facts the server needs.
      </SceneCaption>
    </Canvas>
  );
};

const ReturnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 92], [0, 1], easeOut);
  const answerIn = interpolate(frame, [62, 88], [0, 1], easeOut);

  return (
    <Canvas tone="paper">
      <div
        style={{
          position: "absolute",
          left: 180,
          right: 180,
          top: 330,
          color: theme.colors.ink,
          fontSize: 104,
          fontWeight: 600,
          letterSpacing: "-0.058em",
          lineHeight: 1.08,
          textAlign: "center",
        }}
      >
        The answer travels
        <br />
        <span
          style={{
            color: theme.colors.blue,
            opacity: answerIn,
          }}
        >
          back to you.
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 420,
          right: 420,
          top: 650,
          height: 8,
          borderRadius: 8,
          background: theme.colors.grayLight,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: `${progress * 100}%`,
            top: "50%",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: theme.colors.blue,
            transform: "translate(50%, -50%)",
          }}
        />
      </div>
      <SceneCaption>
        The same path runs in reverse to deliver the response.
      </SceneCaption>
    </Canvas>
  );
};

const BottleneckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const machineIn = interpolate(frame, [8, 28], [0, 1], easeOut);
  const requestCount = Math.min(8, Math.floor(frame / 10) + 1);

  return (
    <Canvas tone="paper">
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 260,
          color: theme.colors.ink,
          fontSize: 116,
          fontWeight: 600,
          letterSpacing: "-0.065em",
          lineHeight: 1.02,
          textAlign: "center",
        }}
      >
        Every request.
        <br />
        <span
          style={{
            display: "inline-block",
            color: theme.colors.blue,
            opacity: machineIn,
            transform: `translateY(${interpolate(machineIn, [0, 1], [28, 0], easeOut)}px)`,
          }}
        >
          One machine.
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 300,
          right: 300,
          top: 660,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {Array.from({ length: requestCount }, (_, index) => (
          <span
            key={index}
            style={{
              color: theme.colors.blue,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              opacity: interpolate(index, [0, 7], [1, 0.35], clamp),
            }}
          >
            request
          </span>
        ))}
      </div>
      <SceneCaption>
        This simplicity works, until one machine becomes the limit.
      </SceneCaption>
    </Canvas>
  );
};

export const SingleServerMaster: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Sequence durationInFrames={5 * fps}>
        <TapScene />
      </Sequence>
      <Sequence from={5 * fps} durationInFrames={5 * fps}>
        <RequestScene />
      </Sequence>
      <Sequence from={10 * fps} durationInFrames={5 * fps}>
        <ServerScene />
      </Sequence>
      <Sequence from={15 * fps} durationInFrames={5 * fps}>
        <DatabaseScene />
      </Sequence>
      <Sequence from={20 * fps} durationInFrames={5 * fps}>
        <ReturnScene />
      </Sequence>
      <Sequence from={seconds(25)} durationInFrames={seconds(5)}>
        <BottleneckScene />
      </Sequence>
    </>
  );
};
