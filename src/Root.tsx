import "./index.css";
import { Folder } from "remotion";
import { BrandCompositions } from "./shared/brand/social/compositions";
import { ProblemSolvingCompositions } from "./tracks/problem-solving/compositions";
import { SystemDesignCompositions } from "./tracks/system-design/compositions";
import { VerticalCompositions } from "./vertical/compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="System-Design">
        <SystemDesignCompositions />
      </Folder>
      <Folder name="Problem-Solving">
        <ProblemSolvingCompositions />
      </Folder>
      <Folder name="Vertical">
        <VerticalCompositions />
      </Folder>
      <Folder name="Brand">
        <BrandCompositions />
      </Folder>
    </>
  );
};
