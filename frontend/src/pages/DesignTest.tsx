import { 
  CheckCircle, Star, Zap, Shield, TrendingUp, AlertCircle,
  Info, X, Check, Heart, Award, Target
} from 'lucide-react';

export default function DesignTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🎨 GovSure Design System - Tailwind CSS Test
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            ✅ If you can see colors, gradients, shadows, and proper spacing - Tailwind CSS is working perfectly!
          </p>

          {/* Color Palette */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorSwatch color="bg-blue-500" name="Primary Blue" />
              <ColorSwatch color="bg-indigo-600" name="Indigo" />
              <ColorSwatch color="bg-purple-500" name="Purple" />
              <ColorSwatch color="bg-green-500" name="Success" />
              <ColorSwatch color="bg-yellow-500" name="Warning" />
              <ColorSwatch color="bg-red-500" name="Danger" />
              <ColorSwatch color="bg-gray-800" name="Dark" />
              <ColorSwatch color="bg-gray-400" name="Gray" />
            </div>
          </section>

          {/* Buttons */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
                Primary Gradient
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Primary Solid
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">
                Secondary
              </button>
              <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Success
              </button>
              <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
                Danger
              </button>
            </div>
          </section>

          {/* Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl hover:scale-105 transition-transform">
                <Zap className="mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Gradient Card</h3>
                <p className="opacity-90">Beautiful gradient background with hover effect</p>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all">
                <Shield className="mb-4 text-blue-600" size={32} />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Border Card</h3>
                <p className="text-gray-600">Clean border with hover effects</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                <Target className="mb-4 text-indigo-600" size={32} />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Shadow Card</h3>
                <p className="text-gray-600">Elevated shadow effect on hover</p>
              </div>
            </div>
          </section>

          {/* Alerts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Alerts & Notifications</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex items-start">
                <Info className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-blue-900">Information</p>
                  <p className="text-blue-700">This is an informational message with Tailwind styling.</p>
                </div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start">
                <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-900">Success</p>
                  <p className="text-green-700">Your changes have been saved successfully!</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start">
                <AlertCircle className="text-yellow-500 mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-yellow-900">Warning</p>
                  <p className="text-yellow-700">Please review your submission before continuing.</p>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
                <X className="text-red-500 mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-700">Something went wrong. Please try again.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Statistics Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Total Revenue"
                value="$8.4M"
                change="+12.5%"
                trend="up"
                icon={<TrendingUp size={24} />}
                color="blue"
              />
              <StatCard
                label="Active Projects"
                value="23"
                change="+8"
                trend="up"
                icon={<Award size={24} />}
                color="green"
              />
              <StatCard
                label="Win Rate"
                value="68%"
                change="+5.2%"
                trend="up"
                icon={<Star size={24} />}
                color="purple"
              />
              <StatCard
                label="Completion Time"
                value="2.3 days"
                change="-35%"
                trend="up"
                icon={<Zap size={24} />}
                color="orange"
              />
            </div>
          </section>

          {/* Typography */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Typography</h2>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">Heading 1 - 5xl</h1>
              <h2 className="text-4xl font-bold text-gray-800">Heading 2 - 4xl</h2>
              <h3 className="text-3xl font-bold text-gray-700">Heading 3 - 3xl</h3>
              <h4 className="text-2xl font-semibold text-gray-600">Heading 4 - 2xl</h4>
              <p className="text-lg text-gray-600">Body text - Large (text-lg)</p>
              <p className="text-base text-gray-600">Body text - Base (text-base)</p>
              <p className="text-sm text-gray-500">Small text - text-sm</p>
              <p className="text-xs text-gray-400">Extra small - text-xs</p>
            </div>
          </section>

          {/* Gradients */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Gradient Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
                Blue → Indigo
              </div>
              <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
                Purple → Pink
              </div>
              <div className="h-32 bg-gradient-to-tr from-green-400 to-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
                Green → Blue
              </div>
            </div>
          </section>

          {/* Shadows & Borders */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Shadows & Borders</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="font-semibold mb-1">Shadow SM</p>
                <p className="text-sm text-gray-600">Subtle shadow</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="font-semibold mb-1">Shadow MD</p>
                <p className="text-sm text-gray-600">Medium shadow</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="font-semibold mb-1">Shadow LG</p>
                <p className="text-sm text-gray-600">Large shadow</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-2xl">
                <p className="font-semibold mb-1">Shadow 2XL</p>
                <p className="text-sm text-gray-600">Extra large</p>
              </div>
            </div>
          </section>

          {/* Form Elements */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Form Elements</h2>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Input Field</label>
                <input
                  type="text"
                  placeholder="Enter your text here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Dropdown</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Textarea</label>
                <textarea
                  rows={4}
                  placeholder="Enter your message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </section>

          {/* Final Status */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
            <Check className="mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold mb-2">✅ Tailwind CSS is Working!</h2>
            <p className="text-xl opacity-90">
              If you can see all the colors, gradients, shadows, and styling above, 
              your Tailwind CSS configuration is perfect!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <div className="text-center">
      <div className={`${color} h-20 rounded-lg shadow-md mb-2 hover:scale-110 transition-transform`}></div>
      <p className="text-sm text-gray-600 font-medium">{name}</p>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  change, 
  trend, 
  icon, 
  color 
}: { 
  label: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <div className={`inline-flex items-center text-sm font-semibold ${
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      }`}>
        {trend === 'up' ? '↑' : '↓'} {change}
      </div>
    </div>
  );
}

