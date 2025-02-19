import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const TelegramAuthHandler = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const telegramUserId = searchParams.get('telegramUserId')
    const username = searchParams.get('username')

    if (telegramUserId && username) {
      // Store the auth data
      const userData = {
        telegramUserId,
        username,
        // Add any other params you need
      }

      localStorage.setItem('user_data', JSON.stringify(userData))

      // Redirect to dashboard or home
      navigate('/dashboard')
    }
  }, [searchParams, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <a href="https://t.me/Mick_Rorty_bot?start=login">Login with Telegram</a>
    </div>
  )
}

export default TelegramAuthHandler
