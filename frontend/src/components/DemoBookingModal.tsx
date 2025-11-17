import { useState } from 'react';
import { X } from 'lucide-react';

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoBookingModal({ isOpen, onClose }: DemoBookingModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    phone: '',
    companyWebsite: '',
    title: '',
    sellTo: '',
    annualRevenue: '',
    teamSize: '',
    hearAbout: '',
  });

  const [recaptchaChecked, setRecaptchaChecked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaChecked) {
      alert('Please verify that you are not a robot');
      return;
    }

    // TODO: Send form data to backend or Calendly
    console.log('Form submitted:', formData);
    
    // For now, redirect to Calendly
    window.open('https://calendly.com/govsure/demo', '_blank');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Missing a bid hits harder than the cost.
            </h2>
            <p className="text-gray-600 mt-2">
              Submit the form to schedule your GovSure tour and get started.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div>
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Work Email */}
            <div>
              <input
                type="email"
                name="workEmail"
                placeholder="Work email"
                value={formData.workEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company Website */}
            <div>
              <input
                type="url"
                name="companyWebsite"
                placeholder="Company website"
                value={formData.companyWebsite}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* We primarily sell to */}
            <div>
              <select
                name="sellTo"
                value={formData.sellTo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="">We primarily sell to</option>
                <option value="federal">Federal Government</option>
                <option value="state">State Government</option>
                <option value="local">Local Government</option>
                <option value="defense">Defense/DoD</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="mixed">Mixed/All Sectors</option>
              </select>
            </div>

            {/* Annual gov. contract revenue */}
            <div>
              <select
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="">Annual gov. contract revenue</option>
                <option value="0-1m">$0 - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m-10m">$5M - $10M</option>
                <option value="10m-25m">$10M - $25M</option>
                <option value="25m-50m">$25M - $50M</option>
                <option value="50m+">$50M+</option>
              </select>
            </div>

            {/* Team size */}
            <div>
              <select
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="">Team size</option>
                <option value="1-5">1-5 employees</option>
                <option value="6-10">6-10 employees</option>
                <option value="11-25">11-25 employees</option>
                <option value="26-50">26-50 employees</option>
                <option value="51-100">51-100 employees</option>
                <option value="100+">100+ employees</option>
              </select>
            </div>

            {/* How did you hear about GovSure? */}
            <div>
              <select
                name="hearAbout"
                value={formData.hearAbout}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="">How did you hear about GovSure?</option>
                <option value="search">Search Engine (Google, Bing)</option>
                <option value="social">Social Media</option>
                <option value="referral">Referral</option>
                <option value="event">Event/Conference</option>
                <option value="article">Article/Blog</option>
                <option value="ad">Advertisement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* reCAPTCHA Placeholder */}
          <div className="mt-6 flex items-center space-x-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              id="recaptcha"
              checked={recaptchaChecked}
              onChange={(e) => setRecaptchaChecked(e.target.checked)}
              className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="recaptcha" className="text-gray-700 font-medium">
              I'm not a robot
            </label>
            <div className="ml-auto">
              <img 
                src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
                alt="reCAPTCHA" 
                className="h-8"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Submit
          </button>

          {/* Privacy Notice */}
          <p className="mt-4 text-center text-sm text-gray-600">
            By clicking "Submit," you agree to the use of your data in accordance with{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              GovSure's Privacy Notice
            </a>
            , including for marketing purposes.
          </p>
        </form>
      </div>
    </div>
  );
}

