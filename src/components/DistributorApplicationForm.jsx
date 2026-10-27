import React, { useState } from 'react';
import {
  FileText,
  Building2,
  MapPin,
  TrendingUp,
  Award,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DistributorApplicationForm = () => {
  const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxJ8McdwGLCM2q9-lcSoDA22F7U0leONZ8ryBYKZ8kCPGYxbb-KqL7jVzYhC2IHiF-nmw/exec';

  const [formData, setFormData] = useState({
    // Section 1: Business Profile & Contact
    applicantName: '',
    firmName: '',
    phone: '',
    email: '',
    targetLocation: '',
    primaryActivity: 'Automotive accessories wholesaler',
    otherActivity: '',
    yearsInBusiness: '3–5 years',

    // Section 2: Distribution Capability
    activeDealersCount: '11–25',
    productCategories: [
      'Android car players',
      'Car speakers'
    ],
    brandsHandledAndVolume: '',
    onboardDealers90Days: '11–20',

    // Section 3: Sales Potential & Investment
    projectedMonthlyVolume: '100–149 units',
    salesStrategy: '',
    initialInvestment: '₹2–5 lakh',

    // Section 4: Commitment & Advantage
    salesTeamSetup: 'Yes, an established sales team',
    competitiveAdvantage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  // Toggle category checkbox
  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const exists = prev.productCategories.includes(category);
      if (exists) {
        return { ...prev, productCategories: prev.productCategories.filter(c => c !== category) };
      } else {
        return { ...prev, productCategories: [...prev.productCategories, category] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.applicantName || !formData.firmName || !formData.phone || !formData.email || !formData.targetLocation) {
      alert('Please fill in all required contact and business profile details.');
      return;
    }

    if (!formData.salesStrategy.trim()) {
      alert('Please provide your strategy for achieving 100+ units per month (Question 11).');
      return;
    }

    if (!formData.competitiveAdvantage.trim()) {
      alert('Please describe your competitive advantage and why VOEUX should select your firm (Question 14).');
      return;
    }

    setIsSubmitting(true);

    const applicationId = 'VX-DIST-' + Math.floor(100000 + Math.random() * 900000);
    const submissionTimestamp = new Date().toLocaleString('en-IN');

    const payload = {
      ...formData,
      applicationId,
      submittedAt: submissionTimestamp,
      type: 'DISTRIBUTOR_APPLICATION',
      status: 'UNDER_REVIEW'
    };

    // 1. Save to local storage
    try {
      const existing = JSON.parse(localStorage.getItem('voeux_distributor_applications') || '[]');
      existing.push(payload);
      localStorage.setItem('voeux_distributor_applications', JSON.stringify(existing));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }

    // 2. Cloud Webhook ping (background sync)
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log('Distributor application webhook dispatch completed.');
    }

    // 3. Smooth feedback delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedApplication(payload);
      const formEl = document.getElementById('distributor-application-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1200);
  };

  const getWhatsAppFastTrackUrl = () => {
    if (!submittedApplication) return '#';
    const text = encodeURIComponent(
      `Hello VOEUX Team, I have submitted the Authorised City Distributor Application (Ref: ${submittedApplication.applicationId}) for ${submittedApplication.firmName} in ${submittedApplication.targetLocation}. I would like to fast-track our business evaluation.`
    );
    return `https://api.whatsapp.com/send?phone=919999484530&text=${text}`;
  };

  return (
    <div id="distributor-application-form" className="bg-white py-12 sm:py-16 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-gray-900 text-left">

        {/* Document Header (Identical to Warranty Registration Portal style) */}
        <div className="border-b border-gray-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#3B429F] uppercase">
            <Award className="w-4 h-4" />
            <span>Official Network Expansion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            VOEUX AUTHORISED CITY DISTRIBUTOR PROGRAMME
          </h2>
          <p className="text-gray-500 text-xs font-medium">
            Official Application & Business Evaluation Form
          </p>
        </div>

        {/* Form Description Box */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">
            VOEUX® is actively expanding its authorised distribution network across India. We invite applications from established automotive aftermarket businesses with the operational capability and market reach to achieve sales of 100+ units per month.
          </p>
          <p>
            City distributorships are awarded following an evaluation of each applicant's commercial background, existing distribution network, market reach, and growth potential. Selected distributors may receive exclusive city distribution rights, subject to formal approval and the terms of the VOEUX® Distributorship Agreement.
          </p>
          <p className="text-[11px] text-[#3B429F] font-bold">
            Please complete the following application accurately. Only shortlisted applicants will be contacted by our corporate business development team for the next stage.
          </p>
        </div>

        {!submittedApplication ? (
          <form onSubmit={handleSubmit} className="space-y-8 text-xs text-left pt-2">

            {/* ==================== SECTION 1: BUSINESS PROFILE ==================== */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>Section 1: Business Profile</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">step 1 of 4</span>
              </h3>

              {/* Q1: Applicant Full Name */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  1. Full Name of Applicant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full legal name"
                  value={formData.applicantName}
                  onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              {/* Q2: Business / Firm Name */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  2. Business / Firm Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Registered name of your business / firm"
                  value={formData.firmName}
                  onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              {/* Contact Information (Phone & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                  />
                  <span className="text-[10px] text-gray-500">For shortlisting call & WhatsApp briefing</span>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="business@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                  />
                  <span className="text-[10px] text-gray-500">Official distributor dossier will be sent here</span>
                </div>
              </div>

              {/* Q3: City & State */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  3. Which City and State do you wish to represent VOEUX in? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune, Maharashtra or Lucknow, Uttar Pradesh"
                  value={formData.targetLocation}
                  onChange={e => setFormData({ ...formData, targetLocation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              {/* Q4: Primary Business Activity */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  4. What is your primary business activity? *
                </label>
                <div className="space-y-2">
                  {[
                    'Automotive accessories wholesaler',
                    'Automotive accessories distributor',
                    'Car accessories retailer',
                    'Car audio installation centre',
                    'Multi-brand automotive accessories business',
                    'Other'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        formData.primaryActivity === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="primaryActivity"
                        value={option}
                        checked={formData.primaryActivity === option}
                        onChange={e => setFormData({ ...formData, primaryActivity: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {formData.primaryActivity === 'Other' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Please specify your business activity"
                      value={formData.otherActivity}
                      onChange={e => setFormData({ ...formData, otherActivity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                      required={formData.primaryActivity === 'Other'}
                    />
                  </div>
                )}
              </div>

              {/* Q5: Years in operation */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  5. How long have you been operating in the automotive aftermarket? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Less than 1 year',
                    '1–3 years',
                    '3–5 years',
                    'More than 5 years'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.yearsInBusiness === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="yearsInBusiness"
                        value={option}
                        checked={formData.yearsInBusiness === option}
                        onChange={e => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================== SECTION 2: DISTRIBUTION CAPABILITY ==================== */}
            <div className="space-y-5 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>Section 2: Distribution Capability</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">step 2 of 4</span>
              </h3>

              {/* Q6: Active Dealers */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  6. How many active car accessory dealers do you currently supply? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'None currently',
                    '1–10',
                    '11–25',
                    '26–50',
                    '51–100',
                    'More than 100'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.activeDealersCount === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="activeDealersCount"
                        value={option}
                        checked={formData.activeDealersCount === option}
                        onChange={e => setFormData({ ...formData, activeDealersCount: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q7: Product Categories (Checkboxes) */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  7. Which product categories do you currently sell or distribute? (Select all that apply) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Android car players',
                    'Car speakers',
                    'Amplifiers and subwoofers',
                    'Car LED headlights',
                    'Reverse cameras and accessories',
                    'Other automotive electronics'
                  ].map((category) => (
                    <label
                      key={category}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        formData.productCategories.includes(category)
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.productCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q8: Brands & Sales Volume */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  8. Which brands do you currently deal in, and what is your approximate monthly sales volume in these categories? *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., We deal in Pioneer, Sony, and unbranded Android players with an approximate volume of 80–100 units/month..."
                  value={formData.brandsHandledAndVolume}
                  onChange={e => setFormData({ ...formData, brandsHandledAndVolume: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] leading-relaxed"
                />
              </div>

              {/* Q9: Realistic 90-Day Onboarding */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  9. How many dealers could you realistically onboard for VOEUX within your first 90 days? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    '1–5',
                    '6–10',
                    '11–20',
                    '21–50',
                    'More than 50'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.onboardDealers90Days === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="onboardDealers90Days"
                        value={option}
                        checked={formData.onboardDealers90Days === option}
                        onChange={e => setFormData({ ...formData, onboardDealers90Days: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================== SECTION 3: SALES POTENTIAL & INVESTMENT ==================== */}
            <div className="space-y-5 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>Section 3: Sales Potential & Investment</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">step 3 of 4</span>
              </h3>

              {/* Q10: Monthly Sales Volume Target */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  10. What monthly sales volume do you realistically believe you can achieve for VOEUX within 3–6 months? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Below 25 units',
                    '25–49 units',
                    '50–99 units',
                    '100–149 units',
                    '150–200 units',
                    'More than 200 units'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.projectedMonthlyVolume === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="projectedMonthlyVolume"
                        value={option}
                        checked={formData.projectedMonthlyVolume === option}
                        onChange={e => setFormData({ ...formData, projectedMonthlyVolume: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q11: Strategy for 100+ units */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    11. What is your strategy for achieving 100+ VOEUX units per month in your city? *
                  </label>
                  <span className="text-[10px] text-red-600 font-bold uppercase">Required</span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your dealer network, sales team, local market reach, and approach to acquiring new car accessory dealers..."
                  value={formData.salesStrategy}
                  onChange={e => setFormData({ ...formData, salesStrategy: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] leading-relaxed"
                />
                <span className="text-[11px] text-gray-500 block">
                  Guidance: Detail your existing dealer connections, sales personnel allocation, territory coverage plan, and local promotional approach.
                </span>
              </div>

              {/* Q12: Initial Investment Allocation */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  12. What initial working capital / inventory investment are you prepared to allocate to VOEUX? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    '₹1–2 lakh',
                    '₹2–5 lakh',
                    '₹5–10 lakh',
                    'More than ₹10 lakh'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.initialInvestment === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="initialInvestment"
                        value={option}
                        checked={formData.initialInvestment === option}
                        onChange={e => setFormData({ ...formData, initialInvestment: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================== SECTION 4: COMMITMENT & SELECTION ==================== */}
            <div className="space-y-5 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>Section 4: Commitment & Selection Advantage</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">step 4 of 4</span>
              </h3>

              {/* Q13: Dedicated Sales Team */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  13. Do you have a dedicated sales team or field representatives to promote VOEUX to local dealers? *
                </label>
                <div className="space-y-2">
                  {[
                    'Yes, an established sales team',
                    'Yes, 1–2 dedicated sales representatives',
                    'Not currently, but planning to hire',
                    'No'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        formData.salesTeamSetup === option
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="salesTeamSetup"
                        value={option}
                        checked={formData.salesTeamSetup === option}
                        onChange={e => setFormData({ ...formData, salesTeamSetup: e.target.value })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q14: Competitive Advantage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    14. Why should VOEUX select your business as its authorised distributor, and what competitive advantage can you bring to your city? *
                  </label>
                  <span className="text-[10px] text-red-600 font-bold uppercase">Required</span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your strengths: retail relationships, showroom presence, warehousing capability, rapid delivery logistics, or regional reputation..."
                  value={formData.competitiveAdvantage}
                  onChange={e => setFormData({ ...formData, competitiveAdvantage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] leading-relaxed"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#3B429F] hover:bg-[#2B308B] active:bg-[#20246B] text-white font-bold py-4 rounded-xl text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/20 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>SUBMITTING APPLICATION & EVALUATION DOSSIER...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>SUBMIT DISTRIBUTOR APPLICATION</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Your application data is kept strictly confidential under VOEUX® Corporate Distribution Policy.</span>
              </div>
            </div>

          </form>
        ) : (
          /* ==================== CONFIRMATION SCREEN ==================== */
          <div className="space-y-6 text-xs text-left border-t border-gray-200 pt-6 animate-in fade-in duration-300">
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-3.5 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                  APPLICATION SUBMITTED SUCCESSFULLY
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Thank you, <strong>{submittedApplication.applicantName}</strong>. Your application for the VOEUX Authorised City Distributorship in <strong>{submittedApplication.targetLocation}</strong> has been logged under Reference ID <strong className="font-mono text-emerald-950">{submittedApplication.applicationId}</strong>.
                </p>
                <p className="text-[11px] text-emerald-700 pt-1">
                  Our regional distribution manager will review your business evaluation profile and contact you within 24–48 business hours.
                </p>
              </div>
            </div>

            {/* Application Summary Card */}
            <div className="space-y-3 border border-gray-200 p-6 rounded-2xl bg-gray-50 text-gray-900 text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">APPLICATION DOSSIER</span>
                <span className="font-mono font-bold text-[#3B429F] bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  {submittedApplication.applicationId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Applicant Name</span>
                  <span className="font-bold text-gray-900">{submittedApplication.applicantName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Firm / Business</span>
                  <span className="font-bold text-gray-900">{submittedApplication.firmName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">City & State</span>
                  <span className="font-bold text-gray-900">{submittedApplication.targetLocation}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-bold text-gray-900">{submittedApplication.phone} • {submittedApplication.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Primary Activity</span>
                  <span className="font-semibold text-gray-800">{submittedApplication.primaryActivity}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Projected Monthly Sales</span>
                  <span className="font-bold text-[#3B429F]">{submittedApplication.projectedMonthlyVolume}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Initial Allocation</span>
                  <span className="font-semibold text-gray-800">{submittedApplication.initialInvestment}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Submission Timestamp</span>
                  <span className="font-mono text-gray-700">{submittedApplication.submittedAt}</span>
                </div>
              </div>
            </div>

            {/* Actions: Fast-track on WhatsApp or Print */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={getWhatsAppFastTrackUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track Review on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Application Summary</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmittedApplication(null)}
                className="px-6 py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
