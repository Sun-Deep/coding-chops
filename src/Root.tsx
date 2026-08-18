import "./index.css";
import { Folder } from "remotion";
import { SystemDesignCompositions } from "./tracks/system-design/compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="System-Design">
      <SystemDesignCompositions />
    </Folder>
  );
};
