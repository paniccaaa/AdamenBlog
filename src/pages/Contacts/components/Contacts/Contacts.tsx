import styles from './Contacts.module.scss'
import GitHubIcon from '@mui/icons-material/GitHub'
import EmailIcon from '@mui/icons-material/Email'
import TelegramIcon from '@mui/icons-material/Telegram'

const links = [
  {
    icon: <GitHubIcon />,
    label: 'GitHub',
    href: 'https://github.com/paniccaaa',
    display: 'github.com/paniccaaa',
  },
  {
    icon: <EmailIcon />,
    label: 'Email',
    href: 'mailto:semaadamenko1@gmail.com',
    display: 'semaadamenko1@gmail.com',
  },
  {
    icon: <TelegramIcon />,
    label: 'Telegram',
    href: 'https://t.me/pannicca',
    display: 't.me/pannicca',
  },
]

export const Contacts: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Контакты</h1>
      <div className={styles.list}>
        {links.map(({ icon, label, href, display }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={styles.card}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.info}>
              <span className={styles.label}>{label}</span>
              <span className={styles.value}>{display}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
