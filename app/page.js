import HeroSlider from '../components/HeroSlider/HeroSlider'
import ReviewsSlider from '../components/ReviewsSlider/ReviewsSlider'
import ContactForm from '../components/ContactForm/ContactForm'
import './page.scss'

export default function Home() {
  return (
    <main className="main">
      <HeroSlider />
      
      <ReviewsSlider />
      
      <section className="services section">
        <div className="container">
          <div className="servicesGrid">
            <div className="serviceCard">
              <div className="serviceIcon">💻</div>
              <h3 className="serviceTitle">Веб-разработка</h3>
              <p className="serviceDescription">
                Создание современных веб-приложений и сайтов с использованием 
                передовых технологий и практик
              </p>
            </div>
            
            <div className="serviceCard">
              <div className="serviceIcon">🎨</div>
              <h3 className="serviceTitle">UI/UX Дизайн</h3>
              <p className="serviceDescription">
                Проектирование пользовательских интерфейсов, которые 
                интуитивны, красивы и эффективны
              </p>
            </div>
            
            <div className="serviceCard">
              <div className="serviceIcon">📱</div>
              <h3 className="serviceTitle">Мобильная разработка</h3>
              <p className="serviceDescription">
                Разработка нативных и кроссплатформенных мобильных приложений 
                для iOS и Android
              </p>
            </div>
            
            <div className="serviceCard">
              <div className="serviceIcon">🚀</div>
              <h3 className="serviceTitle">Оптимизация</h3>
              <p className="serviceDescription">
                Повышение производительности и скорости загрузки ваших 
                веб-приложений
              </p>
            </div>
            
            <div className="serviceCard">
              <div className="serviceIcon">🛡️</div>
              <h3 className="serviceTitle">Безопасность</h3>
              <p className="serviceDescription">
                Защита ваших приложений от угроз и обеспечение безопасности 
                пользовательских данных
              </p>
            </div>
            
            <div className="serviceCard">
              <div className="serviceIcon">☁️</div>
              <h3 className="serviceTitle">Cloud сервисы</h3>
              <p className="serviceDescription">
                Развертывание и масштабирование приложений в облачных 
                инфраструктурах AWS, Azure, GCP
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactForm />
    </main>
  )
}

