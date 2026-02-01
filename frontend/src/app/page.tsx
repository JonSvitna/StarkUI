'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

interface ApiResponse {
  message: string
  status?: string
  timestamp?: string
  capabilities?: string[]
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<ApiResponse | null>(null)
  const [jarvisData, setJarvisData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        
        const [statusRes, jarvisRes] = await Promise.all([
          fetch(`${apiUrl}/`),
          fetch(`${apiUrl}/api/jarvis`)
        ])
        
        if (statusRes.ok) {
          const data = await statusRes.json()
          setBackendStatus(data)
        }
        
        if (jarvisRes.ok) {
          const data = await jarvisRes.json()
          setJarvisData(data)
        }
      } catch (error) {
        console.error('Error fetching backend data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>StarkUI</h1>
        <p className={styles.subtitle}>Jarvis Completion System</p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Backend Status</h2>
            {loading ? (
              <p>Connecting...</p>
            ) : backendStatus ? (
              <>
                <p className={styles.status}>{backendStatus.message}</p>
                <p className={styles.timestamp}>
                  Status: <span className={styles.online}>{backendStatus.status}</span>
                </p>
              </>
            ) : (
              <p className={styles.error}>Backend unavailable</p>
            )}
          </div>

          <div className={styles.card}>
            <h2>Jarvis System</h2>
            {loading ? (
              <p>Initializing...</p>
            ) : jarvisData ? (
              <>
                <p className={styles.status}>{jarvisData.message}</p>
                {jarvisData.capabilities && (
                  <ul className={styles.capabilities}>
                    {jarvisData.capabilities.map((cap, idx) => (
                      <li key={idx}>{cap}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className={styles.error}>Jarvis offline</p>
            )}
          </div>
        </div>

        <div className={styles.deployment}>
          <h3>Deployment Info</h3>
          <p>Frontend: Deployed on Vercel</p>
          <p>Backend: Deployed on Railway</p>
        </div>
      </div>
    </main>
  )
}
