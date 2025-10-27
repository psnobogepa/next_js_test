'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import styles from './ReviewsSlider.module.scss'
import './ReviewsSlider.scss'

const reviews = [
  {
    id: 1,
    name: 'Алексей Иванов',
    role: 'Директор компании TechCorp',
    text: 'Отличная работа! Команда создала для нас потрясающий веб-сайт. Профессиональный подход и качественный результат.',
    rating: 5
  },
  {
    id: 2,
    name: 'Мария Петрова',
    role: 'Основатель стартапа Innovation',
    text: 'Невероятно довольна сотрудничеством. Сайт получился современным и функциональным. Рекомендую!',
    rating: 5
  },
  {
    id: 3,
    name: 'Дмитрий Сидоров',
    role: 'CEO Digital Solutions',
    text: 'Прекрасная разработка интернет-магазина. Сайт работает быстро, дизайн современный. Благодарен команде!',
    rating: 5
  },
  {
    id: 4,
    name: 'Елена Козлова',
    role: 'Владелица кафе Delight',
    text: 'Создали отличный лендинг для нашего кафе. Дизайн современный, все функции работают отлично. Спасибо!',
    rating: 5
  },
  {
    id: 5,
    name: 'Игорь Морозов',
    role: 'Фрилансер',
    text: 'Нужен был личный сайт-портфолио. Сделали именно то, что хотел. Быстро, качественно, профессионально.',
    rating: 5
  },
  {
    id: 6,
    name: 'Ольга Волкова',
    role: 'Блогер и контент-мейкер',
    text: 'Отличный блог-сайт! Красивый дизайн и удобная админ-панель. Довольна результатом на 100%.',
    rating: 5
  },
]

export default function ReviewsSlider() {
  return (
    <section className={`${styles.reviewsSection} reviews-section`}>
      <div className={`container ${styles.container}`}>
        <h2 className={styles.title}>
          Отзывы клиентов
        </h2>
        <p className={styles.description}>
          Что говорят о нас наши клиенты
        </p>

        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          navigation={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Navigation, Autoplay]}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            992: {
              slidesPerView: 3,
            }
          }}
          className="mySwiper"
          allowTouchMove={true}
          grabCursor={true}
          centeredSlides={false}
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className={styles.reviewCard}>
                <div className={styles.rating}>
                  {'★'.repeat(review.rating)}
                </div>
                <p className={styles.reviewText}>
                  "{review.text}"
                </p>
                <div className={styles.reviewAuthor}>
                  <h3 className={styles.authorName}>
                    {review.name}
                  </h3>
                  <p className={styles.authorRole}>
                    {review.role}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
