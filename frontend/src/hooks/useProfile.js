import { useState, useEffect } from 'react'
import { getProfile, createProfile, updateProfile } from '../services/api'
import { useSession } from '../App'

export function useProfile() {
  const { sessionId, profile, setProfile, setHasProfile } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sessionId && !profile) {
      getProfile(sessionId)
        .then(res => {
          setProfile(res.data)
          setHasProfile(true)
        })
        .catch(() => {})
    }
  }, [sessionId])

  const saveProfile = async (data) => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (profile) {
        res = await updateProfile(sessionId, data)
      } else {
        res = await createProfile({ ...data, session_id: sessionId })
      }
      setProfile(res.data)
      setHasProfile(true)
      return res.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, error, saveProfile }
}
