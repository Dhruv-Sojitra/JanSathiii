import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import ProgressBar from '../components/ProgressBar'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading, saveProfile } = useProfile()
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    state: 'Maharashtra',
    district: '',
    area_type: 'urban',
    annual_income: '',
    occupation: '',
    education_level: '10th Pass',
    is_student: false,
    is_farmer: false,
    has_disability: false,
    disability_type: '',
    is_bpl: false,
    caste_category: 'general',
    has_aadhaar: false,
    has_bank_account: false,
    preferred_language: 'en'
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Calculate completion percentage
  const calculateCompletion = () => {
    const required = ['name', 'age', 'gender', 'state', 'district', 'area_type', 'annual_income', 'occupation', 'education_level', 'caste_category']
    const filled = required.filter(key => formData[key] !== '' && formData[key] !== null).length
    return Math.round((filled / required.length) * 100)
  }

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile
      }))
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const dataToSave = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
        annual_income: formData.annual_income ? parseFloat(formData.annual_income) : null
      }
      
      await saveProfile(dataToSave)
      setSuccess(true)
      setTimeout(() => {
        navigate('/schemes')
      }, 1400)
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading && !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  const completion = calculateCompletion()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <span>Citizen Profile</span>
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Complete your profile to let JanSathiii find government schemes and scholarships tailored for you.
        </p>
        
        <div className="mt-6 bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700 dark:text-slate-300">Profile Completion</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">{completion}%</span>
          </div>
          <ProgressBar progress={completion} color={completion === 100 ? 'bg-emerald-500' : 'bg-primary-600'} />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-900">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-start gap-3 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <p className="font-medium">Profile saved successfully! Redirecting to your matching schemes...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Basic Info */}
          <div className="md:col-span-2 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Enter your full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Age</label>
                  <input required type="number" name="age" value={formData.age} onChange={handleChange} className="input-field" placeholder="e.g. 25" min="0" max="120" />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input-field cursor-pointer">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="md:col-span-2 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location &amp; Demographics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">State</label>
                <select name="state" value={formData.state} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>
              <div>
                <label className="label">District</label>
                <input required type="text" name="district" value={formData.district} onChange={handleChange} className="input-field" placeholder="Enter district" />
              </div>
              <div>
                <label className="label">Area Type</label>
                <select name="area_type" value={formData.area_type} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="urban">Urban</option>
                  <option value="rural">Rural</option>
                </select>
              </div>
            </div>
          </div>

          {/* Socio-Economic */}
          <div className="md:col-span-2 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Socio-Economic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Annual Family Income (₹)</label>
                <input required type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} className="input-field" placeholder="e.g. 250000" />
                {formData.annual_income && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    ₹ {(Number(formData.annual_income) / 100000).toFixed(2)} Lakhs / year
                  </p>
                )}
              </div>
              <div>
                <label className="label">Caste Category</label>
                <select name="caste_category" value={formData.caste_category} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="general">General</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC (Scheduled Caste)</option>
                  <option value="st">ST (Scheduled Tribe)</option>
                </select>
              </div>
              <div>
                <label className="label">Education Level</label>
                <select name="education_level" value={formData.education_level} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="Below 10th">Below 10th</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                </select>
              </div>
              <div>
                <label className="label">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="input-field" placeholder="e.g. Student, Farmer, Small Business" />
              </div>
            </div>
          </div>

          {/* Specific Categories */}
          <div className="md:col-span-2 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Special Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <input type="checkbox" name="is_student" checked={formData.is_student} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">I am a Student</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <input type="checkbox" name="is_farmer" checked={formData.is_farmer} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">I am a Farmer</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <input type="checkbox" name="is_bpl" checked={formData.is_bpl} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Below Poverty Line (BPL)</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <input type="checkbox" name="has_disability" checked={formData.has_disability} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Person with Disability (Divyangjan)</span>
              </label>
            </div>
            
            {formData.has_disability && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <label className="label">Disability Type / Percentage</label>
                <input type="text" name="disability_type" value={formData.disability_type} onChange={handleChange} className="input-field" placeholder="e.g. Locomotor Disability 40%" />
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Documents & Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <input type="checkbox" name="has_aadhaar" checked={formData.has_aadhaar} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Have Aadhaar Card</span>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <input type="checkbox" name="has_bank_account" checked={formData.has_bank_account} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Have Bank Account linked with Aadhaar</span>
              </label>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 text-base shadow-lg"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving Profile...' : 'Save Profile & Find Schemes'}
          </button>
        </div>
      </form>
    </div>
  )
}
