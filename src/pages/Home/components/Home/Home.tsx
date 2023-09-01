import React from "react";

import { PostBlock } from "../../../../modules/Post";
import styles from "./Home.module.scss";

export const Home: React.FC = () => {
  return (
    <div className={styles.posts_container}>
      <PostBlock />
    </div>
  );
};
