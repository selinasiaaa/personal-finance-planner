import { useState } from 'react'

export const useForm = (initialState, onSubmit) => {
  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const setError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }

  const reset = () => {
    setFormData(initialState)
    setErrors({})
  }

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    errors,
    setError,
    reset,
  }
}
