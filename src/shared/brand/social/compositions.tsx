import { Folder, Still } from "remotion";
import { BrandAvatar } from "./Avatar";
import { BrandBanner } from "./Banner";

/**
 * Every profile and cover asset, at the size each platform asks for.
 *
 * Sizes and safe areas were taken from each platform's current guidance in
 * September 2026 rather than from memory, and are recorded in
 * `docs/social-assets.md` with the source next to each figure.

 */
export const BrandCompositions: React.FC = () => (
  <>
    <Folder name="Avatars">
      <Still
        id="Brand-Avatar-YouTube"
        component={BrandAvatar}
        width={800}
        height={800}
      />
      <Still
        id="Brand-Avatar-Instagram"
        component={BrandAvatar}
        width={1080}
        height={1080}
      />
      <Still
        id="Brand-Avatar-Facebook"
        component={BrandAvatar}
        width={1080}
        height={1080}
      />
      <Still
        id="Brand-Avatar-X"
        component={BrandAvatar}
        width={400}
        height={400}
      />
    </Folder>
    <Folder name="Banners">
      <Still
        id="Brand-Banner-YouTube"
        component={BrandBanner}
        width={2560}
        height={1440}
        defaultProps={{ safeWidth: 1546, safeHeight: 423 }}
      />
      <Still
        id="Brand-Banner-X"
        component={BrandBanner}
        width={1500}
        height={500}
        defaultProps={{ safeWidth: 1200, safeHeight: 360 }}
      />
      <Still
        id="Brand-Banner-Facebook"
        component={BrandBanner}
        width={1640}
        height={624}
        defaultProps={{ safeWidth: 1280, safeHeight: 480 }}
      />
    </Folder>
  </>
);
