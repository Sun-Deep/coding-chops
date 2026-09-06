import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const inter = loadInter("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

// The Problem Solving mono role. Section 16 of the problem-solving visual
// language: array literals, arithmetic, variable names and code. Declared here
// rather than in a scene so one episode cannot quietly pick a different face.
const mono = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

// The logotype face, and only the logotype. Inter keeps every other role in
// every frame of every episode. A logotype is one locked piece of art rather
// than running text, so it can carry a face the body copy does not, and it
// should agree with the mark standing next to it: the mark is built from
// square corners and flat terminals, and Inter's C is round.
const archivo = loadArchivo("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

export const theme = {
  colors: {
    black: "#050505",
    blackSoft: "#101113",
    paper: "#F4F2EC",
    paperBright: "#FBFAF7",
    ink: "#111214",
    gray: "#74767B",
    grayLight: "#C8C7C2",
    // The light-on-dark counterpart to ink. Warm rather than white, so a
    // stroke on the dark canvas reads as pencil on dark paper rather than
    // chalk on slate.
    chalk: "#E9E4D8",
    grayDark: "#8A8B8F",
    // Problem Solving semantic colours. The chart, the prices and the days
    // stay neutral. Colour appears only where it carries meaning, so a frame
    // with no trade on it has no colour in it at all.
    buy: "#4D9BFF",
    // Yellow rather than the amber this started as. Amber sat right next to
    // the brand orange, so once the channel reads as orange, a SELL label in a
    // teaching frame reads as brand colour. Yellow is unmistakably not the
    // brand, and still pairs warm against the cool buy blue.
    sell: "#EFC94C",
    gain: "#3FBF87",
    loss: "#E8635D",
    blue: "#1769E0",
    blueBright: "#4D9BFF",
    // The brand accent. Warm, so it sits on the paper canvas as ink on stock
    // rather than as the cool contrast cobalt makes. Bright is the near-black
    // counterpart, since the burnt tone goes muddy on a dark ground.
    orange: "#E4571B",
    orangeBright: "#FF7A33",
    white: "#FFFFFF",
  },
  fontFamily: inter.fontFamily,
  monoFamily: mono.fontFamily,
  /** Locked to the wordmark. Never use it for a headline or for body copy. */
  wordmarkFamily: archivo.fontFamily,
} as const;
