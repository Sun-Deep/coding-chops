import { loadFont } from "@remotion/google-fonts/Inter";

const inter = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
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
    blue: "#1769E0",
    blueBright: "#4D9BFF",
    white: "#FFFFFF",
  },
  fontFamily: inter.fontFamily,
} as const;
