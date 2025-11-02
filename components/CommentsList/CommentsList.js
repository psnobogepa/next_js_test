'use client'

import { useState, useEffect } from 'react'
import { getComments } from '../../lib/api'
import styles from './CommentsList.module.scss'

export default function CommentsList() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getComments({ pageSize: 50 })
      setComments(response.data || [])
      console.log(response.data)
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке комментариев')
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading) {
    return (
      <section className={styles.commentsSection}>
        <div className="container">
          <div className={styles.loading}>Загрузка комментариев...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.commentsSection}>
        <div className="container">
          <div className={styles.error}>
            ❌ {error}
            <button onClick={fetchComments} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.commentsSection}>
      <div className="container">
        <h2 className="sectionTitle">Комментарии</h2>
        {comments.length === 0 ? (
          <div className={styles.emptyState}>
            Пока нет комментариев. Будьте первым!
          </div>
        ) : (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.commentCard}>
                <div className={styles.commentHeader}>
                  <div className={styles.authorInfo}>
                    <h3 className={styles.authorName}>{comment.name}</h3>
                    <span className={styles.authorEmail}>{comment.email}</span>
                    {comment.phone && (
                      <span className={styles.authorPhone}>{comment.phone}</span>
                    )}
                  </div>
                  <span className={styles.commentDate}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <div className={styles.commentMessage}>
                  {comment.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

