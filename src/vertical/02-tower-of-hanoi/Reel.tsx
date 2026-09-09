import { Fragment } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { Sfx } from "../../shared/primitives/Sfx";
import { clamp } from "../../shared/video/timing";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { END_CARD_FROM, MOVE_LENGTH } from "./beats";
import { narration } from "./narration";
import { TowerOfHanoiTraversal } from "./Tower";
import { MOVES, MOVE_COUNT } from "./measurements";

const EndLockup: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [END_CARD_FROM + 18, END_CARD_FROM + 34],
    [0, 1],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 650,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${interpolate(opacity, [0, 1], [14, 0])}px)`,
      }}
    >
      <Lockup size={62} tone="black" stacked />
    </div>
  );
};

export const TowerOfHanoiReel: React.FC = () => (
  <VerticalShell handOverAt={END_CARD_FROM + 18}>
    <TowerOfHanoiTraversal />
    <Narration lines={narration} />
    <EndLockup />

    {MOVES.map((move, index) => {
      const start = index * MOVE_LENGTH;
      const weight = (move.disk - 1) / 3;
      const playbackRate = 1.12 - weight * 0.24;
      return (
        <Fragment key={start}>
          <Sfx
            name="plate-lift"
            at={start}
            gain={5 + weight * 1.2}
            playbackRate={playbackRate}
          />
          <Sfx
            name="plate-swish"
            at={start + 9}
            gain={7.5 + weight * 1.5}
            playbackRate={playbackRate}
          />
          <Sfx
            name="plate-land"
            at={start + 27}
            gain={5.2 + weight * 0.8}
            playbackRate={playbackRate}
          />
          {[31, 35, 38].map((offset, step) => (
            <Sfx
              key={offset}
              name="code-step"
              at={start + offset}
              gain={5.2}
              playbackRate={1 + step * 0.08}
            />
          ))}
        </Fragment>
      );
    })}
    <Sfx name="solved" at={MOVE_COUNT * MOVE_LENGTH} gain={4.4} />
    <Sfx name="settle" at={650} gain={5.5} />
    <Sfx name="name" at={END_CARD_FROM + 28} gain={5} />
  </VerticalShell>
);
