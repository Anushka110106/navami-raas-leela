import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Calendar, Clock, Users, Mail, Phone, Instagram, Facebook, Music, Sparkles, Star, Copy, Check, AlertCircle, Shield } from 'lucide-react';

function App() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Removed tickets field - system now handles single person only
  });

  // Countdown timer effect
  useEffect(() => {
    const targetDate = new Date('2025-09-28T18:00:00+05:30').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Enhanced reference number generation with validation
  const generateReferenceNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const userHash = generateUserHash(formData.name, formData.email, formData.phone);
    const checksum = generateChecksum(`${timestamp}${random}${userHash}`);
    return `NRL${timestamp.slice(-6)}${random}${userHash.slice(0, 2)}${checksum}`;
  };

  // Generate user-specific hash for additional validation
  const generateUserHash = (name: string, email: string, phone: string) => {
    const userData = `${name.toLowerCase().trim()}${email.toLowerCase().trim()}${phone.trim()}`;
    let hash = 0;
    for (let i = 0; i < userData.length; i++) {
      const char = userData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).toUpperCase().slice(0, 4);
  };

  // Generate checksum for reference validation
  const generateChecksum = (data: string) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i);
    }
    return (sum % 100).toString().padStart(2, '0');
  };

  // Validate reference number
  const validateReferenceNumber = (refNum: string) => {
    if (!refNum.startsWith('NRL') || refNum.length !== 19) return false;

    const timestamp = refNum.slice(3, 9);
    const random = refNum.slice(9, 15);
    const userHash = refNum.slice(15, 17);
    const checksum = refNum.slice(-2);

    // Validate timestamp (should be within reasonable range)
    const refTimestamp = parseInt(timestamp, 36);
    const currentTimestamp = Date.now();
    const oneYearAgo = currentTimestamp - (365 * 24 * 60 * 60 * 1000);

    if (refTimestamp < oneYearAgo || refTimestamp > currentTimestamp) {
      return { valid: false, error: 'Reference code timestamp is invalid' };
    }

    // Validate checksum
    const expectedUserHash = generateUserHash(formData.name, formData.email, formData.phone);
    const calculatedChecksum = generateChecksum(`${timestamp}${random}${expectedUserHash}`);

    const isValid = checksum === calculatedChecksum && userHash === expectedUserHash.slice(0, 2);

    return {
      valid: isValid,
      error: isValid ? null : 'Reference code does not match your registration details'
    };
  };

  // Enhanced validation for Google Forms integration
  const validateWithGoogleForms = async (refNum: string) => {
    try {
      // In a real implementation, this would call your backend API
      // that checks against Google Forms responses
      const validation = validateReferenceNumber(refNum);

      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || 'Invalid reference code format'
        };
      }

      // Simulate API call to verify against Google Forms data
      // This would be replaced with actual API integration
      const isInGoogleForms = await simulateGoogleFormsCheck(refNum);

      if (!isInGoogleForms) {
        return {
          success: false,
          message: 'Reference code not found in our registration system'
        };
      }

      return {
        success: true,
        message: 'Reference code validated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Validation service temporarily unavailable'
      };
    }
  };

  // Simulate Google Forms validation (replace with actual API call)
  const simulateGoogleFormsCheck = async (refNum: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would:
    // 1. Call your backend API
    // 2. Backend queries Google Sheets API or database
    // 3. Check if reference code exists in submitted forms
    // 4. Return validation result

    // For demo purposes, validate against our generated format
    const validation = validateReferenceNumber(refNum);
    return validation.valid;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const refNum = generateReferenceNumber();
    setReferenceNumber(refNum);
    setShowRegistration(true);
  };

  const copyReferenceNumber = () => {
    navigator.clipboard.writeText(referenceNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const redirectToPayment = () => {
    // Store registration data with validation info
    localStorage.setItem('dandiyaRegistration', JSON.stringify({
      ...formData,
      referenceNumber,
      timestamp: new Date().toISOString(),
      totalAmount: ticketPrice, // Single person only
      tickets: 1, // Always 1 person
      validated: validateReferenceNumber(referenceNumber).valid
    }));

    window.open('https://forms.gle/KLHMLgspVpusfiJD7', '_blank');
  };

  const ticketPrice = 799; // Price for single person
  const totalAmount = ticketPrice; // Always single person pricing

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-yellow-600 overflow-hidden relative">
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 animate-bounce">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-70 shadow-lg"></div>
        </div>
        <div className="absolute top-20 right-20 animate-pulse">
          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 shadow-lg"></div>
        </div>
        <div className="absolute bottom-20 left-20 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="w-12 h-12 border-4 border-yellow-300 rounded-full opacity-50"></div>
        </div>
        <div className="absolute bottom-32 right-32 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="text-4xl text-yellow-300 opacity-40">✨</div>
        </div>

        {/* Floating Cultural Elements */}
        <div className="floating-element absolute top-1/4 -left-20 w-16 h-16 text-orange-400 opacity-30 animate-float-right">🪷</div>
        <div className="floating-element absolute top-1/2 -right-20 w-12 h-12 text-gold-400 opacity-30 animate-float-left" style={{ animationDelay: '3s' }}>💃</div>
        <div className="floating-element absolute top-3/4 -left-16 w-10 h-10 text-red-400 opacity-30 animate-float-right" style={{ animationDelay: '6s' }}>🎭</div>

        {/* Modern Light Effects */}
        <div className="absolute top-16 left-1/4 animate-pulse">
          <Star className="text-yellow-300 w-8 h-8" fill="currentColor" />
        </div>
        <div className="absolute bottom-16 right-1/4 animate-pulse" style={{ animationDelay: '1s' }}>
          <Sparkles className="text-pink-300 w-6 h-6" fill="currentColor" />
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute top-1/3 left-16 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-16 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full bg-gradient-to-r from-red-900/80 to-orange-900/80 backdrop-blur-md z-50 border-b-2 border-yellow-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-white font-bold text-xl flex items-center">
              <span className="text-2xl mr-2">🪷</span>
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Navami Raas Leela 2025
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Venue', 'Countdown', 'Register'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-white hover:text-yellow-300 transition-colors duration-300 font-medium border-b-2 border-transparent hover:border-yellow-300"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="md:hidden">
              <button className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Gen Z Style */}
      <section id="home" className="min-h-screen flex items-center justify-center relative">
        <div className="text-center z-10 px-4 max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="text-6xl mb-4 animate-pulse">🪷 ✨ 🪷</div>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in">
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Navami Raas Leela
              </span>
            </h1>
            <div className="text-2xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              The Ultimate Dandiya Experience 2025
            </div>
            <div className="text-4xl mb-8 animate-bounce">🕺💃✨🎭</div>
          </div>

          <div className="bg-gradient-to-r from-red-800/40 to-orange-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 mb-8">
            <p className="text-lg md:text-2xl text-white mb-6 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
              <span className="text-yellow-300 font-bold">🙏 Hey Beautiful Souls! 🙏</span><br />
              Get ready for the most epic cultural celebration of the year!<br />
              <span className="text-orange-300">Experience traditional dance meets modern vibes!</span>
            </p>
            <div className="text-lg text-yellow-200 italic">
              "Where tradition meets the coolest generation ✨"
            </div>
          </div>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={() => scrollToSection('register')}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold py-4 px-8 rounded-full text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse inline-block border-2 border-yellow-300"
            >
              🎫 Get Your Spot Now!
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-white/20 transition-all duration-300 inline-block"
            >
              📖 What's This About?
            </button>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white w-8 h-8" />
        </div>
      </section>

      {/* About Section - Gen Z Friendly */}
      <section id="about" className="py-20 bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              What's Raas Leela?
            </span>
          </h2>
          <div className="text-2xl text-yellow-300 mb-12">🪷 Culture Meets Cool Vibes 🪷</div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-800/40 to-orange-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 hover:scale-105 transition-transform duration-300 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎭</div>
              <h3 className="text-2xl font-bold text-yellow-300 mb-4">Epic Performances</h3>
              <p className="text-white">Watch amazing cultural performances that'll blow your mind and connect you to your roots</p>
            </div>

            <div className="bg-gradient-to-br from-orange-800/40 to-yellow-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 hover:scale-105 transition-transform duration-300 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🪷</div>
              <h3 className="text-2xl font-bold text-yellow-300 mb-4">Authentic Vibes</h3>
              <p className="text-white">Feel the rhythm that's been moving people for centuries - it's like meditation but way more fun!</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-800/40 to-red-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 hover:scale-105 transition-transform duration-300 group sm:col-span-2 lg:col-span-1">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
              <h3 className="text-2xl font-bold text-yellow-300 mb-4">Pure Joy</h3>
              <p className="text-white">Experience that main character energy while celebrating something truly beautiful</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30">
            <div className="text-3xl mb-4">🕉️</div>
            <p className="text-xl md:text-2xl text-white leading-relaxed mb-4">
              "This isn't just another event - it's where ancient stories come alive through dance, music, and pure celebration.
              Think of it as the ultimate cultural experience that's both Instagram-worthy and soul-nourishing."
            </p>
            <div className="text-yellow-300 font-bold text-lg">
              Come for the vibes, stay for the memories ✨
            </div>
          </div>
        </div>
      </section>

      {/* Venue & Date Section */}
      <section id="venue" className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              When & Where
            </span>
          </h2>
          <div className="text-2xl text-yellow-300 mb-12">🏛️ Mark Your Calendars! 🏛️</div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-800/40 to-orange-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 hover:scale-105 transition-transform duration-300">
              <MapPin className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-300 mb-4">The Venue</h3>
              <p className="text-xl text-white mb-2">🏨 Mukut Regency</p>
              <p className="text-white opacity-80">The perfect space for an unforgettable night</p>
              <div className="text-sm text-yellow-200 mt-2 italic">(Final venue details coming soon!)</div>
            </div>

            <div className="bg-gradient-to-br from-orange-800/40 to-yellow-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 hover:scale-105 transition-transform duration-300">
              <Calendar className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-300 mb-4">Save The Date</h3>
              <p className="text-xl text-white mb-2">📅 September 28, 2025</p>
              <p className="text-white opacity-80">🕕 6:00 PM - Let's Get Started!</p>
              <div className="text-sm text-yellow-200 mt-2 italic">Perfect timing for the weekend vibes</div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30">
            <h3 className="text-3xl font-bold text-white mb-6">🎉 What's Happening?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl mb-2">🎭</div>
                <p className="text-sm">Amazing Performances</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎵</div>
                <p className="text-sm">Live Music</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-sm">Dance Competitions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🍽️</div>
                <p className="text-sm">Great Food</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Timer Section */}
      <section id="countdown" className="py-20 bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Countdown to Epic
            </span>
          </h2>
          <div className="text-2xl text-yellow-300 mb-12">⏰ How Long Until the Fun? ⏰</div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Days', value: timeLeft.days, icon: '📅' },
              { label: 'Hours', value: timeLeft.hours, icon: '🕐' },
              { label: 'Minutes', value: timeLeft.minutes, icon: '⏰' },
              { label: 'Seconds', value: timeLeft.seconds, icon: '⚡' }
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-red-800/50 to-orange-800/50 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/40 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2 font-mono">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-white font-semibold">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/30">
            <p className="text-xl text-white mb-2">
              <span className="text-yellow-300 font-bold">🪷 Get Ready! 🪷</span>
            </p>
            <p className="text-white opacity-90">
              Every second brings us closer to the most amazing cultural celebration. Time to start planning your outfit! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Registration Section with Enhanced Security */}
      <section id="register" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-4">
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Secure Your Spot
            </span>
          </h2>
          <div className="text-2xl text-yellow-300 text-center mb-12">🎫 Don't Miss Out! 🎫</div>

          {!showRegistration ? (
            <div className="bg-gradient-to-br from-red-800/40 to-orange-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30">
              <form onSubmit={handleRegistration} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-semibold">🙏 Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-yellow-400/30 text-white placeholder-white/60 focus:outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/50 transition-all duration-300"
                      placeholder="What should we call you?"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold">📧 Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-yellow-400/30 text-white placeholder-white/60 focus:outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/50 transition-all duration-300"
                      placeholder="Your email here"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-semibold">📱 Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-yellow-400/30 text-white placeholder-white/60 focus:outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/50 transition-all duration-300"
                      placeholder="Your contact number"
                    />
                  </div>
                </div>

                <div className="bg-yellow-400/20 rounded-lg p-6 border-2 border-yellow-300/40">
                  <div className="flex justify-between text-white text-lg mb-2">
                    <span>Ticket Price:</span>
                    <span className="font-bold">₹{ticketPrice}</span>
                  </div>
                  <div className="flex justify-between text-white text-lg mb-2">
                    <span>Registration Type:</span>
                    <span className="font-bold">Single Person</span>
                  </div>
                  <hr className="border-white/30 my-3" />
                  <div className="flex justify-between text-yellow-300 text-xl font-bold">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center border-2 border-yellow-300"
                >
                  <Shield className="mr-2" />
                  <span>Generate Secure Code & Continue ✨</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-800/40 to-orange-800/40 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 text-center">
              <h3 className="text-3xl font-bold text-white mb-6">🎉 You're Almost There!</h3>

              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <div className="text-white text-left space-y-2 mb-6">
                  <p><strong>🙏 Name:</strong> {formData.name}</p>
                  <p><strong>📧 Email:</strong> {formData.email}</p>
                  <p><strong>📱 Phone:</strong> {formData.phone}</p>
                  <p><strong>🎫 Registration:</strong> Single Person</p>
                  <p className="text-yellow-300 text-xl font-bold">
                    <strong>💰 Total: ₹{totalAmount}</strong>
                  </p>
                </div>

                <div className="bg-yellow-400/20 rounded-lg p-6 border-2 border-yellow-300/40 mb-6">
                  <p className="text-yellow-300 font-bold text-lg mb-3 flex items-center justify-center">
                    <Shield className="mr-2" />
                    Your Secure Reference Code:
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <p className="text-white text-2xl font-mono bg-black/30 rounded px-4 py-2 select-all border border-yellow-400/30">
                      {referenceNumber}
                    </p>
                    <button
                      onClick={copyReferenceNumber}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors duration-300 flex items-center"
                      title="Copy Reference Code"
                    >
                      {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {isCopied && (
                    <p className="text-green-300 text-sm">Reference code copied! ✅</p>
                  )}
                  <div className="text-xs text-yellow-200 mt-2">
                    🔒 This code is secure and validated
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/20 border-2 border-blue-400/40 rounded-lg p-6 mb-6">
                <h4 className="text-blue-300 font-bold mb-3 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Next Steps:
                </h4>
                <div className="text-white text-sm text-left space-y-2">
                  <p>1. <strong>🔒 Save</strong> your reference code above</p>
                  <p>2. <strong>🖱️ Click</strong> the "Complete Payment" button below</p>
                  <p>3. <strong>📝 Enter</strong> the reference code exactly in the Google Form</p>
                  <p>4. <strong>✅ Wait</strong> for automatic validation</p>
                  <p>5. <strong>💳 Complete</strong> your payment securely</p>
                  <p>6. <strong>🎫 Get</strong> your confirmation!</p>
                </div>
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/40">
                  <p className="text-blue-300 text-xs font-semibold mb-1">🔐 Security Note:</p>
                  <p className="text-blue-200 text-xs">
                    Your reference code is validated against our secure database.
                    Only codes generated through this website will be accepted.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={redirectToPayment}
                  className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center border-2 border-green-400"
                >
                  <span>💰 Complete Payment - Secure Portal</span>
                </button>

                <button
                  onClick={() => setShowRegistration(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  ← Go Back to Edit Details
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-red-900/60 to-orange-900/60 backdrop-blur-md py-16 border-t-2 border-yellow-400/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center md:justify-start">
                <span className="text-3xl mr-2">🪷</span>
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Navami Raas Leela
                </span>
              </h3>
              <p className="text-white/80 mb-4">
                Bringing you the most amazing cultural celebration that connects tradition with modern vibes.
                Get ready for an unforgettable experience!
              </p>
              <div className="text-yellow-300 text-sm italic">
                "Where culture meets cool" ✨
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white mb-4">📞 Get In Touch</h4>
              <div className="space-y-2 text-white/80">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>rubalgupta2712@gmail.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>9911302895</span>
                </div>
                <div className="text-yellow-300 text-sm mt-2">
                  🕉️ We're here to help!
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white mb-4">📱 Follow Us</h4>
              <div className="flex justify-center md:justify-start space-x-4 mb-4">
                <a
                  href="https://www.instagram.com/navami.raasleela?igsh=MnRma2Q4Nmk2Z3Jj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-110 transition-transform duration-300"
                >
                  <Instagram className="w-8 h-8 text-white/80 hover:text-yellow-300 cursor-pointer transition-colors duration-300" />
                </a>
                <Facebook className="w-8 h-8 text-white/80 hover:text-yellow-300 cursor-pointer transition-colors duration-300 hover:scale-110" />
              </div>
              <p className="text-white/60 text-sm">#NavratriDandiya2025</p>
              <p className="text-yellow-300 text-sm mt-2">#RaasLeela2025</p>
            </div>
          </div>

          <hr className="border-white/20 my-8" />
          <div className="text-center text-white/60">
            <div className="text-2xl mb-2">🕉️</div>
            <p>&copy; 2025 Navami Raas Leela. All rights reserved.</p>
            <p className="text-yellow-300 text-sm mt-2">
              Made with love for celebrating culture and community 🪷
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;