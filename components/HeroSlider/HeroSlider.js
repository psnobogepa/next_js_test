'use client'

import Link from 'next/link'
import styles from './HeroSlider.module.scss'

export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Создаем современные веб-приложения для вашего бизнеса
          </h1>
          <p className={styles.heroDescription}>
            Профессиональная разработка сайтов и веб-приложений с использованием 
            новейших технологий. Мы поможем вашему бизнесу достичь новых высот в интернете.
          </p>
          <Link href="/test">
            <button className={styles.heroButton}>
              Начать проект
            </button>
          </Link>
        </div>
        <div className={styles.heroImage}>
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"
            alt="Web Development"
          />
        </div>
      </div>
    </section>
  )
}
