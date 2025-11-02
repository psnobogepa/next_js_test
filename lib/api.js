const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function createComment(commentData) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name: commentData.name,
          email: commentData.email,
          phone: commentData.phone || null,
          message: commentData.message,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Ошибка при создании комментария')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

export async function getComments(options = {}) {
  try {
    const { page = 1, pageSize = 25, sort = 'createdAt:desc' } = options
    
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      sort,
    })

    const response = await fetch(`${STRAPI_API_URL}/api/comments?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Ошибка при получении комментариев')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
}

export async function getComment(id) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/comments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Ошибка при получении комментария')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching comment:', error)
    throw error
  }
}

