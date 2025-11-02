'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import styles from './ContactForm.module.scss'

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const response = await fetch(`${STRAPI_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            message: data.message,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Ошибка при отправке сообщения')
      }

      setIsSubmitting(false)
      setSubmitSuccess(true)
      reset()

      window.location.reload()
      
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      setIsSubmitting(false)
      setSubmitError(error.message || 'Произошла ошибка при отправке сообщения')
      console.error('Error submitting form:', error)
    }
  }

  return (
    <section className={styles.contactSection}>
      <div className="container">
        <h2 className="sectionTitle">Свяжитесь с нами</h2>
        <p className="sectionDescription">
          Заполните форму ниже, и мы свяжемся с вами в ближайшее время
        </p>

        <div className={styles.formWrapper}>
          {submitSuccess && (
            <div className={styles.successMessage}>
              ✅ Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
            </div>
          )}

          {submitError && (
            <div className={styles.errorMessageBlock}>
              ❌ {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Имя *
              </label>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Имя обязательно для заполнения',
                  minLength: {
                    value: 2,
                    message: 'Имя должно содержать минимум 2 символа',
                  },
                })}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Введите ваше имя"
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email *
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email обязателен для заполнения',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Некорректный email адрес',
                  },
                })}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Телефон
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  pattern: {
                    value: /^[\d\s\-\+\(\)]+$/,
                    message: 'Некорректный номер телефона',
                  },
                })}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="+7 (999) 123-45-67"
              />
              {errors.phone && (
                <span className={styles.errorMessage}>{errors.phone.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                Сообщение *
              </label>
              <textarea
                id="message"
                rows={6}
                {...register('message', {
                  required: 'Сообщение обязательно для заполнения',
                  minLength: {
                    value: 10,
                    message: 'Сообщение должно содержать минимум 10 символов',
                  },
                })}
                className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                placeholder="Расскажите о вашем проекте..."
              />
              {errors.message && (
                <span className={styles.errorMessage}>{errors.message.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

