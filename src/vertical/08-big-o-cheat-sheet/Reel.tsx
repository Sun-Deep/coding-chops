import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { ComplexityRace } from "./ComplexityRace";
import { narration } from "./narration";

export const BigOCheatSheetReel: React.FC = () => (
  <VerticalShell>
    <ComplexityRace />
    <Narration lines={narration} />

    {[0, 60, 120, 180, 240, 300, 360, 414].map((at, index) => (
      <Sfx key={at} name="tick" at={at} gain={2.7 + index * 0.14} />
    ))}
    <Sfx name="land" at={414} gain={4.2} />
  </VerticalShell>
);
