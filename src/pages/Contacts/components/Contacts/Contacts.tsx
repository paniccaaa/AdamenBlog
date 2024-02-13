import styles from "./Contacts.module.scss";

export const Contacts: React.FC = () => {
  return (
    <div>
      <h1 className={styles.contacts_text}>
        Telegram: <a href="https://t.me/pannicca">t.me/pannicca</a>
      </h1>
      <h1 className={styles.contacts_text}>
        Email: <a>semaadamenko1@gmail.com</a>
      </h1>
    </div>
  );
};
