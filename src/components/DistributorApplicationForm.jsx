import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  FileText,
  Award,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Printer,
  ShieldCheck,
  ArrowLeft,
  Languages
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    backToOverview: 'Back to Distributor Program Overview',
    networkExpansion: 'Official Network Expansion',
    mainTitle: 'VOEUX AUTHORISED CITY DISTRIBUTOR PROGRAMME',
    subTitle: 'Official Application & Business Evaluation Form',
    descP1: 'VOEUX® is actively expanding its authorised distribution network across India. We invite applications from established automotive aftermarket businesses with the operational capability and market reach to achieve sales of 100+ units per month.',
    descP2: "City distributorships are awarded following an evaluation of each applicant's commercial background, existing distribution network, market reach, and growth potential. Selected distributors may receive exclusive city distribution rights, subject to formal approval and the terms of the VOEUX® Distributorship Agreement.",
    descP3: 'Please complete the following application accurately. Only shortlisted applicants will be contacted by our corporate business development team for the next stage.',
    
    // Section 1
    step1: 'Section 1: Business Profile',
    step1Of4: 'step 1 of 4',
    q1Label: '1. Full Name of Applicant *',
    q1Placeholder: 'Enter your full legal name',
    q2Label: '2. Business / Firm Name *',
    q2Placeholder: 'Registered name of your business / firm',
    phoneLabel: 'Mobile / WhatsApp Number *',
    phonePlaceholder: '10-digit mobile number',
    phoneHint: 'For shortlisting call & WhatsApp briefing',
    emailLabel: 'Official Email Address *',
    emailPlaceholder: 'business@example.com',
    emailHint: 'Official distributor dossier will be sent here',
    q3Label: '3. Which City and State do you wish to represent VOEUX in? *',
    q3Placeholder: 'e.g. Pune, Maharashtra or Lucknow, Uttar Pradesh',
    q4Label: '4. What is your primary business activity? *',
    q4Options: [
      'Automotive accessories wholesaler',
      'Automotive accessories distributor',
      'Car accessories retailer',
      'Car audio installation centre',
      'Multi-brand automotive accessories business',
      'Other'
    ],
    otherActivityPlaceholder: 'Please specify your business activity',
    q5Label: '5. How long have you been operating in the automotive aftermarket? *',
    q5Options: [
      'Less than 1 year',
      '1–3 years',
      '3–5 years',
      'More than 5 years'
    ],

    // Section 2
    step2: 'Section 2: Distribution Capability',
    step2Of4: 'step 2 of 4',
    q6Label: '6. How many active car accessory dealers do you currently supply? *',
    q6Options: [
      'None currently',
      '1–10',
      '11–25',
      '26–50',
      '51–100',
      'More than 100'
    ],
    q7Label: '7. Which product categories do you currently sell or distribute? (Select all that apply) *',
    q7Options: [
      'Android car players',
      'Car speakers',
      'Amplifiers and subwoofers',
      'Car LED headlights',
      'Reverse cameras and accessories',
      'Other automotive electronics'
    ],
    q8Label: '8. Which brands do you currently deal in, and what is your approximate monthly sales volume in these categories? *',
    q8Placeholder: 'e.g., We deal in Pioneer, Sony, and unbranded Android players with an approximate volume of 80–100 units/month...',
    q9Label: '9. How many dealers could you realistically onboard for VOEUX within your first 90 days? *',
    q9Options: [
      '1–5',
      '6–10',
      '11–20',
      '21–50',
      'More than 50'
    ],

    // Section 3
    step3: 'Section 3: Sales Potential & Investment',
    step3Of4: 'step 3 of 4',
    q10Label: '10. What monthly sales volume do you realistically believe you can achieve for VOEUX within 3–6 months? *',
    q10Options: [
      'Below 25 units',
      '25–49 units',
      '50–99 units',
      '100–149 units',
      '150–200 units',
      'More than 200 units'
    ],
    q11Label: '11. What initial working capital / inventory investment are you prepared to allocate to VOEUX? *',
    q11Options: [
      '₹1–2 lakh',
      '₹2–5 lakh',
      '₹5–10 lakh',
      'More than ₹10 lakh'
    ],

    // Section 4
    step4: 'Section 4: Commitment & Selection Advantage',
    step4Of4: 'step 4 of 4',
    q12Label: '12. Do you have a dedicated sales team or field representatives to promote VOEUX to local dealers? *',
    q12Options: [
      'Yes, an established sales team',
      'Yes, 1–2 dedicated sales representatives',
      'Not currently, but planning to hire',
      'No'
    ],
    q13Label: '13. Why should VOEUX select your business as its authorised distributor, and what competitive advantage can you bring to your city? *',
    q13Placeholder: 'Share your strengths: retail relationships, showroom presence, warehousing capability, rapid delivery logistics, or regional reputation...',

    required: 'Required',
    submitButton: 'SUBMIT DISTRIBUTOR APPLICATION',
    submittingButton: 'SUBMITTING APPLICATION & EVALUATION DOSSIER...',
    confidentialText: 'Your application data is kept strictly confidential under VOEUX® Corporate Distribution Policy.',
    
    // Alerts
    alertRequired: 'Please fill in all required contact and business profile details.',
    alertQ13: 'Please describe your competitive advantage and why VOEUX should select your firm (Question 13).',

    // Confirmation Screen
    appSubmittedSuccess: 'APPLICATION SUBMITTED SUCCESSFULLY',
    ackSubtitle: 'OFFICIAL BUSINESS EVALUATION DOSSIER REGISTERED',
    thankYouText: (name, city, refId) => (
      <>
        Thank you, <strong>{name}</strong>. Your application for the VOEUX Authorised City Distributorship in <strong>{city}</strong> has been logged under Reference ID <strong className="font-mono text-[#3B429F]">{refId}</strong>.
      </>
    ),
    reviewNotice: 'Our regional distribution manager will review your business evaluation profile and contact you within 24–48 business hours.',
    dossierTitle: 'APPLICATION DOSSIER',
    evaluationStatus: 'Under Review',
    applicantNameLabel: 'Applicant Name',
    firmNameLabel: 'Firm / Business',
    cityStateLabel: 'City & State',
    contactLabel: 'Contact',
    primaryActivityLabel: 'Primary Activity',
    projectedSalesLabel: 'Projected Monthly Sales',
    initialAllocationLabel: 'Initial Allocation',
    submissionTimeLabel: 'Submission Timestamp',
    fastTrackWhatsApp: 'Fast-Track Review on WhatsApp',
    printSummary: 'Print Application Summary',
    distributorOverview: 'Distributor Overview',
    submitAnother: 'Submit Another Application'
  },

  hi: {
    backToOverview: 'डिस्ट्रीब्यूटर प्रोग्राम विवरण पर वापस जाएं',
    networkExpansion: 'आधिकारिक नेटवर्क विस्तार',
    mainTitle: 'VOEUX® अधिकृत सिटी डिस्ट्रीब्यूटर प्रोग्राम',
    subTitle: 'आधिकारिक आवेदन एवं व्यवसाय मूल्यांकन प्रपत्र',
    descP1: 'VOEUX® पूरे भारत में अपने अधिकृत वितरण नेटवर्क का तेजी से विस्तार कर रहा है। हम स्थापित ऑटोमोटिव आफ्टरमार्केट व्यवसायों से आवेदन आमंत्रित करते हैं जो प्रति माह 100+ यूनिट्स की बिक्री करने की क्षमता रखते हैं।',
    descP2: 'सिटी डिस्ट्रीब्यूटरशिप का चयन प्रत्येक आवेदक की व्यावसायिक पृष्ठभूमि, मौजूदा वितरण नेटवर्क, बाजार में पहुंच और विकास क्षमता के मूल्यांकन के बाद किया जाएगा। चयनित वितरकों को औपचारिक अनुमोदन पर एक्सक्लूसिव सिटी वितरण अधिकार दिए जा सकते हैं।',
    descP3: 'कृपया नीचे दिए गए आवेदन को ध्यानपूर्वक और सही भरें। केवल शॉर्टलिस्ट किए गए आवेदकों से हमारी कॉर्पोरेट बिज़नेस डेवलपमेंट टीम आगे के चरण के लिए संपर्क करेगी।',
    
    // Section 1
    step1: 'भाग 1: व्यावसायिक विवरण',
    step1Of4: 'चरण 1 / 4',
    q1Label: '1. आवेदक का पूरा नाम *',
    q1Placeholder: 'अपना पूरा कानूनी नाम दर्ज करें',
    q2Label: '2. फर्म / व्यापार का नाम *',
    q2Placeholder: 'अपनी फर्म / कंपनी का पंजीकृत नाम दर्ज करें',
    phoneLabel: 'मोबाइल / व्हाट्सएप नंबर *',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    phoneHint: 'शॉर्टलिस्टिंग कॉल एवं व्हाट्सएप अपडेट के लिए',
    emailLabel: 'आधिकारिक ईमेल पता *',
    emailPlaceholder: 'business@example.com',
    emailHint: 'आधिकारिक डिस्ट्रीब्यूटर डोज़ियर इसी ईमेल पर भेजा जाएगा',
    q3Label: '3. आप किस शहर और राज्य में VOEUX का प्रतिनिधित्व करना चाहते हैं? *',
    q3Placeholder: 'उदा. पुणे, महाराष्ट्र या लखनऊ, उत्तर प्रदेश',
    q4Label: '4. आपकी मुख्य व्यावसायिक गतिविधि क्या है? *',
    q4Options: [
      'ऑटोमोटिव एक्सेसरीज होलसेलर (थोक विक्रेता)',
      'ऑटोमोटिव एक्सेसरीज डिस्ट्रीब्यूटर (वितरक)',
      'कार एक्सेसरीज रिटेलर (खुदरा विक्रेता)',
      'कार ऑडियो इंस्टॉलेशन सेंटर',
      'मल्टी-ब्रांड ऑटोमोटिव एक्सेसरीज व्यवसाय',
      'अन्य'
    ],
    otherActivityPlaceholder: 'कृपया अपनी व्यावसायिक गतिविधि निर्दिष्ट करें',
    q5Label: '5. आप ऑटोमोटिव आफ्टरमार्केट में कितने समय से कार्यरत हैं? *',
    q5Options: [
      '1 वर्ष से कम',
      '1–3 वर्ष',
      '3–5 वर्ष',
      '5 वर्ष से अधिक'
    ],

    // Section 2
    step2: 'भाग 2: वितरण नेटवर्क और क्षमता',
    step2Of4: 'चरण 2 / 4',
    q6Label: '6. वर्तमान में आप कितने सक्रिय कार एक्सेसरी डीलरों को माल सप्लाई करते हैं? *',
    q6Options: [
      'वर्तमान में कोई नहीं',
      '1–10',
      '11–25',
      '26–50',
      '51–100',
      '100 से अधिक'
    ],
    q7Label: '7. वर्तमान में आप किन श्रेणियों के उत्पाद बेचते या वितरित करते हैं? (लागू सभी चुनें) *',
    q7Options: [
      'एंड्रॉइड कार प्लेयर्स',
      'कार स्पीकर्स',
      'एम्पलीफायर्स और सबवूफर्स',
      'कार एलईडी हेडलाइट्स',
      'रिवर्स कैमरा और एक्सेसरीज',
      'अन्य ऑटोमोटिव इलेक्ट्रॉनिक्स'
    ],
    q8Label: '8. वर्तमान में आप किन ब्रांड्स में काम करते हैं और इन श्रेणियों में आपकी अनुमानित मासिक बिक्री क्या है? *',
    q8Placeholder: 'उदा. हम पायनियर, सोनी और सामान्य एंड्रॉइड प्लेयर्स में काम करते हैं, मासिक बिक्री लगभग 80–100 यूनिट्स है...',
    q9Label: '9. पहले 90 दिनों में आप VOEUX के लिए वास्तविक रूप से कितने डीलर्स जोड़ सकते हैं? *',
    q9Options: [
      '1–5',
      '6–10',
      '11–20',
      '21–50',
      '50 से अधिक'
    ],

    // Section 3
    step3: 'भाग 3: बिक्री संभावना एवं निवेश',
    step3Of4: 'चरण 3 / 4',
    q10Label: '10. अगले 3–6 महीनों में आप VOEUX के लिए वास्तविक रूप से कितनी मासिक बिक्री का लक्ष्य हासिल कर सकते हैं? *',
    q10Options: [
      '25 यूनिट्स से कम',
      '25–49 यूनिट्स',
      '50–99 यूनिट्स',
      '100–149 यूनिट्स',
      '150–200 units',
      '200 यूनिट्स से अधिक'
    ],
    q11Label: '11. आप VOEUX के लिए प्रारंभिक कार्यशील पूंजी / इन्वेंटरी निवेश के रूप में कितना आवंटित करने के लिए तैयार हैं? *',
    q11Options: [
      '₹1–2 लाख',
      '₹2–5 लाख',
      '₹5–10 लाख',
      '₹10 लाख से अधिक'
    ],

    // Section 4
    step4: 'भाग 4: प्रतिबद्धता एवं चयन लाभ',
    step4Of4: 'चरण 4 / 4',
    q12Label: '12. क्या आपके पास स्थानीय डीलरों को VOEUX को प्रमोट करने के लिए समर्पित सेल्स टीम या फील्ड प्रतिनिधि हैं? *',
    q12Options: [
      'हाँ, एक स्थापित सेल्स टीम है',
      'हाँ, 1–2 समर्पित सेल्स प्रतिनिधि हैं',
      'अभी नहीं, लेकिन नियुक्त करने की योजना है',
      'नहीं'
    ],
    q13Label: '13. VOEUX को आपके व्यवसाय को अधिकृत डिस्ट्रीब्यूटर के रूप में क्यों चुनना चाहिए, और आप अपने शहर में क्या प्रतिस्पर्धात्मक लाभ ला सकते हैं? *',
    q13Placeholder: 'अपनी ताकत साझा करें: डीलर संबंध, शोरूम उपस्थिति, वेयरहाउसिंग क्षमता, त्वरित डिलीवरी लॉजिस्टिक्स, या क्षेत्रीय प्रतिष्ठा...',

    required: 'आवश्यक',
    submitButton: 'डिस्ट्रीब्यूटर आवेदन जमा करें',
    submittingButton: 'आवेदन एवं मूल्यांकन डोज़ियर जमा हो रहा है...',
    confidentialText: 'आपका आवेदन डेटा VOEUX® कॉर्पोरेट वितरण नीति के तहत पूर्णतः गोपनीय रखा जाता है।',

    // Alerts
    alertRequired: 'कृपया सभी आवश्यक संपर्क और व्यावसायिक प्रोफ़ाइल विवरण भरें।',
    alertQ13: 'कृपया अपना प्रतिस्पर्धात्मक लाभ और VOEUX को आपकी फर्म क्यों चुननी चाहिए, इसका विवरण दें (प्रश्न 13)।',

    // Confirmation Screen
    appSubmittedSuccess: 'आवेदन सफलतापूर्वक जमा हुआ',
    ackSubtitle: 'आधिकारिक व्यवसाय मूल्यांकन डोज़ियर पंजीकृत',
    thankYouText: (name, city, refId) => (
      <>
        धन्यवाद, <strong>{name}</strong>। <strong>{city}</strong> में VOEUX अधिकृत सिटी डिस्ट्रीब्यूटरशिप के लिए आपका आवेदन संदर्भ संख्या <strong className="font-mono text-[#3B429F]">{refId}</strong> के तहत दर्ज कर लिया गया है।
      </>
    ),
    reviewNotice: 'हमारे क्षेत्रीय वितरण प्रबंधक 24–48 व्यावसायिक घंटों के भीतर आपके व्यवसाय मूल्यांकन प्रोफ़ाइल की समीक्षा करेंगे और आपसे संपर्क करेंगे।',
    dossierTitle: 'आवेदन डोज़ियर (APPLICATION DOSSIER)',
    evaluationStatus: 'समीक्षाधीन (Under Review)',
    applicantNameLabel: 'आवेदक का नाम',
    firmNameLabel: 'फर्म / व्यवसाय',
    cityStateLabel: 'शहर और राज्य',
    contactLabel: 'संपर्क विवरण',
    primaryActivityLabel: 'मुख्य व्यावसायिक गतिविधि',
    projectedSalesLabel: 'अनुमानित मासिक बिक्री',
    initialAllocationLabel: 'प्रारंभिक निवेश आवंटन',
    submissionTimeLabel: 'आवेदन दर्ज करने का समय',
    fastTrackWhatsApp: 'व्हाट्सएप पर फास्ट-ट्रैक समीक्षा प्राप्त करें',
    printSummary: 'आवेदन विवरण प्रिंट करें',
    distributorOverview: 'डिस्ट्रीब्यूटर विवरण',
    submitAnother: 'दूसरा आवेदन जमा करें'
  }
};

export const DistributorApplicationForm = () => {
  const { setActivePage } = useShop();

  const [lang, setLang] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        if (window.location.hash === '#hi' || window.location.search.includes('lang=hi')) {
          return 'hi';
        }
        return localStorage.getItem('voeux_distributor_form_lang') || 'en';
      }
    } catch (e) {}
    return 'en';
  });

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('voeux_distributor_form_lang', newLang);
    } catch (e) {}
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

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
    initialInvestment: '₹2–5 lakh',

    // Section 4: Commitment & Advantage
    salesTeamSetup: 'Yes, an established sales team',
    competitiveAdvantage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  // Toggle category checkbox (stored with canonical English identifier for consistency)
  const handleCategoryToggle = (canonicalCategory) => {
    setFormData(prev => {
      const exists = prev.productCategories.includes(canonicalCategory);
      if (exists) {
        return { ...prev, productCategories: prev.productCategories.filter(c => c !== canonicalCategory) };
      } else {
        return { ...prev, productCategories: [...prev.productCategories, canonicalCategory] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.applicantName || !formData.firmName || !formData.phone || !formData.email || !formData.targetLocation) {
      alert(t.alertRequired);
      return;
    }

    if (!formData.competitiveAdvantage.trim()) {
      alert(t.alertQ13);
      return;
    }

    setIsSubmitting(true);

    const applicationId = 'VX-DIST-' + Math.floor(100000 + Math.random() * 900000);
    const submissionTimestamp = new Date().toLocaleString('en-IN');

    const payload = {
      ...formData,
      action: 'distributor_application',
      type: 'DISTRIBUTOR_APPLICATION',
      applicationId,
      submittedAt: submissionTimestamp,
      submissionLanguage: lang === 'hi' ? 'Hindi' : 'English',
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const getWhatsAppFastTrackUrl = () => {
    if (!submittedApplication) return '#';
    const text = encodeURIComponent(
      `Hello VOEUX Team, I have submitted the Authorised City Distributor Application (Ref: ${submittedApplication.applicationId}) for ${submittedApplication.firmName} in ${submittedApplication.targetLocation}. I would like to fast-track our business evaluation.`
    );
    return `https://api.whatsapp.com/send?phone=919999484530&text=${text}`;
  };

  return (
    <div id="distributor-application-form" className="min-h-screen bg-white py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-gray-900 text-left">

        {/* Top Control Bar: Back Button & Language Toggle */}
        <div className="flex items-center justify-between gap-3 pb-2">
          <button
            type="button"
            onClick={() => {
              setActivePage('join-us');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#3B429F] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToOverview}</span>
          </button>

          {/* Discreet, Professional Language Selector */}
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50/90 p-0.5 text-[11px] font-semibold text-gray-600 shadow-xs">
            <span className="pl-1.5 pr-1 text-gray-400 flex items-center">
              <Languages className="w-3 h-3" />
            </span>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                lang === 'hi'
                  ? 'bg-[#3B429F] text-white font-bold shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Document Header */}
        <div className="border-b border-gray-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#3B429F] uppercase">
            <Award className="w-4 h-4" />
            <span>{t.networkExpansion}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {t.mainTitle}
          </h2>
          <p className="text-gray-500 text-xs font-medium">
            {t.subTitle}
          </p>
        </div>

        {/* Form Description Box */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">
            {t.descP1}
          </p>
          <p>
            {t.descP2}
          </p>
          <p className="text-[11px] text-[#3B429F] font-bold">
            {t.descP3}
          </p>
        </div>

        {!submittedApplication ? (
          <form onSubmit={handleSubmit} className="space-y-8 text-xs text-left pt-2">

            {/* ==================== SECTION 1: BUSINESS PROFILE ==================== */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>{t.step1}</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">{t.step1Of4}</span>
              </h3>

              {/* Q1: Applicant Full Name */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q1Label}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.q1Placeholder}
                  value={formData.applicantName}
                  onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              {/* Q2: Business / Firm Name */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q2Label}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.q2Placeholder}
                  value={formData.firmName}
                  onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              {/* Contact Information (Phone & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                  />
                  <span className="text-[10px] text-gray-500">{t.phoneHint}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={t.emailPlaceholder}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                  />
                  <span className="text-[10px] text-gray-500">{t.emailHint}</span>
                </div>
              </div>

              {/* Q3: City & State */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q3Label}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.q3Placeholder}
                  value={formData.targetLocation}
                  onChange={e => setFormData({ ...formData, targetLocation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F]"
                />
              </div>

              {/* Q4: Primary Business Activity */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q4Label}
                </label>
                <div className="space-y-2">
                  {TRANSLATIONS.en.q4Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        formData.primaryActivity === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="primaryActivity"
                        value={canonicalOption}
                        checked={formData.primaryActivity === canonicalOption}
                        onChange={() => setFormData({ ...formData, primaryActivity: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q4Options[idx]}</span>
                    </label>
                  ))}
                </div>

                {formData.primaryActivity === 'Other' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder={t.otherActivityPlaceholder}
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
                  {t.q5Label}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRANSLATIONS.en.q5Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.yearsInBusiness === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="yearsInBusiness"
                        value={canonicalOption}
                        checked={formData.yearsInBusiness === canonicalOption}
                        onChange={() => setFormData({ ...formData, yearsInBusiness: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q5Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================== SECTION 2: DISTRIBUTION CAPABILITY ==================== */}
            <div className="space-y-5 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>{t.step2}</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">{t.step2Of4}</span>
              </h3>

              {/* Q6: Active Dealers */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q6Label}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSLATIONS.en.q6Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.activeDealersCount === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="activeDealersCount"
                        value={canonicalOption}
                        checked={formData.activeDealersCount === canonicalOption}
                        onChange={() => setFormData({ ...formData, activeDealersCount: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q6Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q7: Product Categories (Checkboxes) */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q7Label}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRANSLATIONS.en.q7Options.map((canonicalCategory, idx) => (
                    <label
                      key={canonicalCategory}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        formData.productCategories.includes(canonicalCategory)
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.productCategories.includes(canonicalCategory)}
                        onChange={() => handleCategoryToggle(canonicalCategory)}
                        className="rounded text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q7Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q8: Brands & Sales Volume */}
              <div className="space-y-1">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q8Label}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={t.q8Placeholder}
                  value={formData.brandsHandledAndVolume}
                  onChange={e => setFormData({ ...formData, brandsHandledAndVolume: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-[#3B429F] leading-relaxed"
                />
              </div>

              {/* Q9: Realistic 90-Day Onboarding */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q9Label}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSLATIONS.en.q9Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.onboardDealers90Days === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="onboardDealers90Days"
                        value={canonicalOption}
                        checked={formData.onboardDealers90Days === canonicalOption}
                        onChange={() => setFormData({ ...formData, onboardDealers90Days: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q9Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================== SECTION 3: SALES POTENTIAL & INVESTMENT ==================== */}
            <div className="space-y-5 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>{t.step3}</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">{t.step3Of4}</span>
              </h3>

              {/* Q10: Monthly Sales Volume Target */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q10Label}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSLATIONS.en.q10Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.projectedMonthlyVolume === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="projectedMonthlyVolume"
                        value={canonicalOption}
                        checked={formData.projectedMonthlyVolume === canonicalOption}
                        onChange={() => setFormData({ ...formData, projectedMonthlyVolume: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q10Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q11: Initial Investment Allocation */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q11Label}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {TRANSLATIONS.en.q11Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        formData.initialInvestment === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="initialInvestment"
                        value={canonicalOption}
                        checked={formData.initialInvestment === canonicalOption}
                        onChange={() => setFormData({ ...formData, initialInvestment: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q11Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================== SECTION 4: COMMITMENT & SELECTION ==================== */}
            <div className="space-y-5 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>{t.step4}</span>
                <span className="text-[11px] text-[#3B429F] font-semibold lowercase">{t.step4Of4}</span>
              </h3>

              {/* Q12: Dedicated Sales Team */}
              <div className="space-y-2">
                <label className="text-gray-900 font-bold block uppercase tracking-wide">
                  {t.q12Label}
                </label>
                <div className="space-y-2">
                  {TRANSLATIONS.en.q12Options.map((canonicalOption, idx) => (
                    <label
                      key={canonicalOption}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        formData.salesTeamSetup === canonicalOption
                          ? 'border-[#3B429F] bg-indigo-50/40 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="salesTeamSetup"
                        value={canonicalOption}
                        checked={formData.salesTeamSetup === canonicalOption}
                        onChange={() => setFormData({ ...formData, salesTeamSetup: canonicalOption })}
                        className="text-[#3B429F] focus:ring-[#3B429F]"
                      />
                      <span>{t.q12Options[idx]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q13: Competitive Advantage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-gray-900 font-bold block uppercase tracking-wide">
                    {t.q13Label}
                  </label>
                  <span className="text-[10px] text-red-600 font-bold uppercase">{t.required}</span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder={t.q13Placeholder}
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
                    <span>{t.submittingButton}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>{t.submitButton}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t.confidentialText}</span>
              </div>
            </div>

          </form>
        ) : (
          /* ==================== EXECUTIVE CORPORATE CONFIRMATION DOSSIER ==================== */
          <div className="space-y-6 text-left border-t border-gray-200 pt-6 animate-in fade-in duration-300">
            
            {/* Master Dossier Card */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
              
              {/* Executive Dark Top Ribbon */}
              <div className="bg-slate-900 text-white px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
                    VOEUX® AUTOMOTIVE ELECTRONICS • OFFICIAL DISTRIBUTOR PROGRAMME
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {t.appSubmittedSuccess}
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>REF: {submittedApplication.applicationId}</span>
                </div>
              </div>

              {/* Acknowledgment Message */}
              <div className="p-5 sm:p-7 border-b border-slate-100 bg-slate-50/40 space-y-2 text-xs leading-relaxed">
                <p className="text-gray-800 text-sm font-normal">
                  {t.thankYouText(submittedApplication.applicantName, submittedApplication.targetLocation, submittedApplication.applicationId)}
                </p>
                <p className="text-gray-500 text-xs">
                  {t.reviewNotice}
                </p>
              </div>

              {/* Dossier Structured Summary Table */}
              <div className="p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
                    {t.dossierTitle}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Status: <strong className="text-emerald-700 font-semibold">{t.evaluationStatus}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-8 text-xs">
                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.applicantNameLabel}</span>
                    <span className="font-semibold text-gray-900 pt-0.5">{submittedApplication.applicantName}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.firmNameLabel}</span>
                    <span className="font-semibold text-gray-900 pt-0.5">{submittedApplication.firmName}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.cityStateLabel}</span>
                    <span className="font-semibold text-gray-900 pt-0.5">{submittedApplication.targetLocation}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.contactLabel}</span>
                    <span className="font-semibold text-gray-900 pt-0.5">{submittedApplication.phone} • {submittedApplication.email}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.primaryActivityLabel}</span>
                    <span className="font-semibold text-gray-900 pt-0.5">{submittedApplication.primaryActivity}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.projectedSalesLabel}</span>
                    <span className="font-semibold text-[#3B429F] pt-0.5">{submittedApplication.projectedMonthlyVolume}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.initialAllocationLabel}</span>
                    <span className="font-semibold text-gray-900 pt-0.5">{submittedApplication.initialInvestment}</span>
                  </div>

                  <div className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t.submissionTimeLabel}</span>
                    <span className="font-mono text-gray-700 pt-0.5">{submittedApplication.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar (Clean corporate buttons & links) */}
              <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-7 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={getWhatsAppFastTrackUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t.fastTrackWhatsApp}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-xs border border-gray-300 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.printSummary}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('join-us');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#3B429F] transition cursor-pointer"
                  >
                    {t.distributorOverview}
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSubmittedApplication(null)}
                    className="hover:text-[#3B429F] transition cursor-pointer"
                  >
                    {t.submitAnother}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
