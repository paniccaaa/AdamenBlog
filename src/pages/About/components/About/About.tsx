import React from 'react'
import styles from './About.module.scss'

const experience = {
  company: 'Magnit Tech',
  role: 'Ведущий Golang разработчик',
  period: 'март 2025 — настоящее время',
  description:
    'Развивал отчётную систему аналитики: продажи, потери, средний чек, трафик покупателей, nps, csi и более 30+ метрик.',
  achievements: [
    {
      title: 'Observability',
      body: 'Настройка дашбордов, метрик и алертов',
    },
    {
      title: 'Кэширование',
      body: 'Реализация различных стратегий кеширования с событийной инвалидацией кэша / TTL',
    },
    {
      title: 'Data-интеграции',
      body: 'Интеграция с внешними источниками: Datalake',
    },
    {
      title: 'Событийная аналитика',
      body: 'Сбор событий из приложения, обработка в ClickHouse и выгрузка в S3 Datalake.',
    },
    {
      title: 'Server Driven UI',
      body: 'Feature-лид по внедрению серверно-управляемого UI — полная независимость от релизного цикла.',
    },
    {
      title: 'Асинхронная отчётность',
      body: 'Генерация агрегированных Excel-отчётов в фоновом режиме на основе операционных данных приложения.',
    },
  ],
}

const technologies: Record<string, string[]> = {
  'Языки и протоколы': ['Golang', 'gRPC', 'REST', 'Protobuf'],
  'Базы данных': ['PostgreSQL', 'ClickHouse', 'Redis'],
  'Очереди': ['Kafka'],
  'Хранилища': ['S3'],
  'Инфраструктура': ['Docker', 'Kubernetes', 'CI/CD'],
  'Мониторинг': ['Grafana', 'Prometheus'],
}

export const About: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Опыт</h2>

        <div className={styles.expCard}>
          <div className={styles.expHeader}>
            <div>
              <span className={styles.company}>{experience.company}</span>
              <span className={styles.role}>{experience.role}</span>
              <span className={styles.period}>{experience.period}</span>
            </div>
          </div>

          <p className={styles.expDesc}>{experience.description}</p>

          <div className={styles.achievementsGrid}>
            {experience.achievements.map(({ title, body }) => (
              <div key={title} className={styles.achievementCard}>
                <span className={styles.achievementTitle}>{title}</span>
                <p className={styles.achievementBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Технологии</h2>

        <div className={styles.techGroups}>
          {Object.entries(technologies).map(([group, items]) => (
            <div key={group} className={styles.techGroup}>
              <span className={styles.techGroupLabel}>{group}</span>
              <div className={styles.techTags}>
                {items.map((tech) => (
                  <span key={tech} className={styles.techTag}>{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
