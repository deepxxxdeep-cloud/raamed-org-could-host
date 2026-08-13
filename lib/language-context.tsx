'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'mr'

export type LanguageOption = {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
]

const translations: Record<Language, Record<string, string>> = {
  en: {
    products: 'Products',
    viewAllEquipment: 'View all equipment',
    aboutUs: 'About us',
    branchNetwork: 'Branch network',
    customers: 'Customers',
    requestQuote: 'Request a quote',
    callUs: 'Call Us',
    talkToSpecialist: 'Talk to a specialist',
    exploreEquipment: 'Explore equipment',
    trustedPartners: 'Trusted clinical partners',
    heroTitle: 'The dependable standard for medical care.',
    heroSubtitle: 'We help hospitals, clinics, and care teams make confident equipment decisions—with practical expertise, responsive support, and technology that performs.',
    qualityChecked: 'Quality checked',
    regionalSupport: 'Regional support',
    equipmentDesk: 'The equipment desk',
    builtAroundCare: 'Built around the way care works.',
    seeFullCatalogue: 'See full catalogue',
    enquireAboutThis: 'Enquire about this',
    noEquipmentFound: 'No equipment currently listed in the catalogue.',
    betterHandover: 'A better handover',
    equipmentBeginning: 'Equipment is only the beginning.',
    handoverSubtitle: 'From product selection to installation and service, our team stays close to your workflow. Get a clear recommendation, transparent documentation, and support that answers.',
    insideClinicalSupport: 'Inside our clinical support',
    raamedInField: 'Raamed in the field',
    exploreRaamed: 'Explore Raamed',
    mediaCentre: 'Media centre',
    talkToTeam: 'Talk to our team',
    delhiHq: 'Delhi HQ',
    monSatHours: 'Mon–Sat, 9:00–18:00 IST',
    copyright: '© 2026 Raamed (RAAMED / RAMMED). Built for dependable medical care. All rights reserved.',
    patientMonitoring: 'Patient monitoring',
    surgicalSystems: 'Surgical systems',
    endoscopySystems: 'Endoscopy systems',
    respiratoryCare: 'Respiratory care',
    sterilizationReprocessing: 'Sterilization & reprocessing',
    selectLanguage: 'Select Language',
    translateWithGoogle: 'Auto-Translate Page',
  },
  hi: {
    products: 'उत्पाद (Products)',
    viewAllEquipment: 'सभी उपकरण देखें',
    aboutUs: 'हमारे बारे में (About us)',
    branchNetwork: 'शाखा नेटवर्क (Branches)',
    customers: 'हमारे ग्राहक (Customers)',
    requestQuote: 'कोटेशन का अनुरोध करें',
    callUs: 'कॉल करें',
    talkToSpecialist: 'विशेषज्ञ से बात करें',
    exploreEquipment: 'उपकरण देखें',
    trustedPartners: 'विश्वसनीय चिकित्सा भागीदार',
    heroTitle: 'चिकित्सा देखभाल के लिए भरोसेमंद मानक।',
    heroSubtitle: 'हम अस्पतालों, क्लीनिकों और स्वास्थ्य टीमों को आत्मविश्वास से उपकरण निर्णय लेने में मदद करते हैं—व्यावहारिक विशेषज्ञता और प्रतिक्रियाशील सहायता के साथ।',
    qualityChecked: 'गुणवत्ता जाँची गई',
    regionalSupport: 'क्षेत्रीय सहायता',
    equipmentDesk: 'उपकरण डेस्क',
    builtAroundCare: 'आपकी देखभाल के तरीके के अनुसार निर्मित।',
    seeFullCatalogue: 'पूरा कैटलॉग देखें',
    enquireAboutThis: 'इसके बारे में पूछताछ करें',
    noEquipmentFound: 'वर्तमान में कैटलॉग में कोई उपकरण सूचीबद्ध नहीं है।',
    betterHandover: 'बेहतर सेवा और डिलीवरी',
    equipmentBeginning: 'उपकरण तो सिर्फ एक शुरुआत है।',
    handoverSubtitle: 'उत्पाद चयन से लेकर स्थापना और सेवा तक, हमारी टीम आपकी कार्यप्रणाली के करीब रहती है। स्पष्ट सिफारिशें और पारदर्शी सहायता प्राप्त करें।',
    insideClinicalSupport: 'हमारी नैदानिक सहायता',
    raamedInField: 'क्षेत्र में रामेड (Raamed)',
    exploreRaamed: 'रामेड खोजें',
    mediaCentre: 'मीडिया केंद्र',
    talkToTeam: 'हमारी टीम से बात करें',
    delhiHq: 'दिल्ली मुख्यालय',
    monSatHours: 'सोम-शनि, 9:00-18:00 IST',
    copyright: '© 2026 रामेड (RAAMED / RAMMED)। विश्वसनीय चिकित्सा देखभाल के लिए निर्मित। सर्वाधिकार सुरक्षित।',
    patientMonitoring: 'रोगी निगरानी (Patient monitoring)',
    surgicalSystems: 'सर्जिकल उपकरण (Surgical systems)',
    endoscopySystems: 'एंडोस्कोपी प्रणाली (Endoscopy systems)',
    respiratoryCare: 'श्वसन देखभाल (Respiratory care)',
    sterilizationReprocessing: 'नसबंदी एवं पुनर्संस्करण',
    selectLanguage: 'भाषा चुनें',
    translateWithGoogle: 'पेज का स्वतः अनुवाद करें',
  },
  bn: {
    products: 'পণ্যসমূহ (Products)',
    viewAllEquipment: 'সমস্ত সরঞ্জাম দেখুন',
    aboutUs: 'আমাদের সম্পর্কে',
    branchNetwork: 'শাখা নেটওয়ার্ক',
    customers: 'গ্রাহকগণ',
    requestQuote: 'কোটেশন অনুরোধ করুন',
    callUs: 'কল করুন',
    talkToSpecialist: 'বিশেষজ্ঞের সাথে কথা বলুন',
    exploreEquipment: 'সরঞ্জাম দেখুন',
    trustedPartners: 'বিশ্বস্ত চিকিৎসা অংশীদার',
    heroTitle: 'চিকিৎসা সেবায় নির্ভরযোগ্য মানদণ্ড।',
    heroSubtitle: 'আমরা হাসপাতাল, ক্লিনিক এবং স্বাস্থ্যসেবা দলগুলিকে নির্ভরযোগ্য সরঞ্জাম নির্বাচনে সহায়তা করি।',
    qualityChecked: 'গুণমান পরীক্ষা করা হয়েছে',
    regionalSupport: 'আঞ্চলিক সহায়তা',
    equipmentDesk: 'সরঞ্জাম ডেস্ক',
    builtAroundCare: 'আপনার সেবার জন্য নির্মিত।',
    seeFullCatalogue: 'সম্পূর্ণ ক্যাটালগ দেখুন',
    enquireAboutThis: 'অনুসন্ধান করুন',
    noEquipmentFound: 'বর্তমানে ক্যাটালগে কোনো সরঞ্জাম তালিকাভুক্ত নেই।',
    betterHandover: 'উন্নত পরিষেবা',
    equipmentBeginning: 'সরঞ্জাম কেবল শুরু মাত্র।',
    handoverSubtitle: 'পণ্য নির্বাচন থেকে ইনস্টলেশন এবং পরিষেবা পর্যন্ত আমাদের দল আপনার সাথেই থাকবে।',
    insideClinicalSupport: 'আমাদের সহায়তা',
    raamedInField: 'মাঠে রামেদ',
    exploreRaamed: 'রামেদ অন্বেষণ করুন',
    mediaCentre: 'মিডিয়া সেন্টার',
    talkToTeam: 'আমাদের দলের সাথে কথা বলুন',
    delhiHq: 'দিল্লি সদর দফতর',
    monSatHours: 'সোম-শনি, ৯:০০-১৮:০০ IST',
    copyright: '© 2026 রামেদ (RAAMED / RAMMED)। সর্বস্বত্ব সংরক্ষিত।',
    patientMonitoring: 'রোগী পর্যবেক্ষণ',
    surgicalSystems: 'সার্জিক্যাল সিস্টেম',
    endoscopySystems: 'এন্ডোস্কোপি সিস্টেম',
    respiratoryCare: 'শ্বাসপ্রশ্বাসের যত্ন',
    sterilizationReprocessing: 'স্টেরিলাইজেশন',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    translateWithGoogle: 'পৃষ্ঠা স্বয়ংক্রিয় অনুবাদ করুন',
  },
  ta: {
    products: 'தயாரிப்புகள் (Products)',
    viewAllEquipment: 'அனைத்து உபகரணங்களையும் காண்க',
    aboutUs: 'எங்களைப் பற்றி',
    branchNetwork: 'கிளை நெட்வொர்க்',
    customers: 'வாடிக்கையாளர்கள்',
    requestQuote: 'விலைப்புள்ளி கேட்கவும்',
    callUs: 'அழைக்கவும்',
    talkToSpecialist: 'நிபுணரிடம் பேசுங்கள்',
    exploreEquipment: 'உபகரணங்களை ஆராயுங்கள்',
    trustedPartners: 'நம்பகமான மருத்துவ கூட்டாளர்கள்',
    heroTitle: 'மருத்துவ பராமரிப்பிற்கான நம்பகமான தரநிலை.',
    heroSubtitle: 'மருத்துவமனைகள் மற்றும் கிளினிக்குகளுக்கு சரியான உபகரணங்களை தேர்வு செய்ய நாங்கள் உதவுகிறோம்.',
    qualityChecked: 'தரம் சரிபார்க்கப்பட்டது',
    regionalSupport: 'மண்டல ஆதரவு',
    equipmentDesk: 'உபகரணங்கள் பிரிவு',
    builtAroundCare: 'உங்கள் பராமரிப்பு தேவைகளுக்காக கட்டப்பட்டது.',
    seeFullCatalogue: 'முழு பட்டியலையும் காண்க',
    enquireAboutThis: 'விசாரிக்கவும்',
    noEquipmentFound: 'தற்போது எந்த உபகரணமும் பட்டியலில் இல்லை.',
    betterHandover: 'சிறந்த சேவை',
    equipmentBeginning: 'உபகரணங்கள் என்பது தொடக்கம் மட்டுமே.',
    handoverSubtitle: 'தயாரிப்பு தேர்வு முதல் நிறுவல் மற்றும் சேவை வரை எங்கள் குழு உங்களுடன் இருக்கும்.',
    insideClinicalSupport: 'எங்கள் மருத்துவ ஆதரவு',
    raamedInField: 'களத்தில் ராமேட்',
    exploreRaamed: 'ராமேட்டை ஆராயுங்கள்',
    mediaCentre: 'ஊடக மையம்',
    talkToTeam: 'எங்கள் குழுவிடம் பேசுங்கள்',
    delhiHq: 'டெல்லி தலைமையகம்',
    monSatHours: 'திங்கள்-சனி, 9:00-18:00 IST',
    copyright: '© 2026 ராமேட் (RAAMED / RAMMED). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    patientMonitoring: 'நோயாளி கண்காணிப்பு',
    surgicalSystems: 'அறுவை சிகிச்சை அமைப்புகள்',
    endoscopySystems: 'எண்டோஸ்கோபி அமைப்புகள்',
    respiratoryCare: 'சுவாச பராமரிப்பு',
    sterilizationReprocessing: 'விருத்தி அற்ற பராமரிப்பு',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    translateWithGoogle: 'பக்கத்தை தானாக மொழிபெயர்க்கவும்',
  },
  mr: {
    products: 'उत्पादने (Products)',
    viewAllEquipment: 'सर्व उपकरणे पहा',
    aboutUs: 'आमच्याबद्दल (About us)',
    branchNetwork: 'शाखा नेटवर्क (Branches)',
    customers: 'ग्राहक (Customers)',
    requestQuote: 'कोटेशनची विनंती करा',
    callUs: 'कॉल करा',
    talkToSpecialist: 'तज्ञांशी बोला',
    exploreEquipment: 'उपकरणे पहा',
    trustedPartners: 'विश्वसनीय वैद्यकीय भागीदार',
    heroTitle: 'वैद्यकीय देखभालीसाठी विश्वासार्ह मानक.',
    heroSubtitle: 'आम्ही रुग्णालये आणि क्लिनिकांना योग्य उपकरणांची निवड करण्यास मदत करतो.',
    qualityChecked: 'गुणवत्ता तपासलेली',
    regionalSupport: 'प्रादेशिक मदत',
    equipmentDesk: 'उपकरणे विभाग',
    builtAroundCare: 'तुमच्या सेवेसाठी बनवलेले.',
    seeFullCatalogue: 'पूर्ण कॅटलॉग पहा',
    enquireAboutThis: 'याबद्दल चौकशी करा',
    noEquipmentFound: 'सध्या कॅटलॉगमध्ये कोणतीही उपकरणे सूचीबद्ध नाहीत.',
    betterHandover: 'उत्कृष्ट सेवा',
    equipmentBeginning: 'उपकरणे ही फक्त सुरुवात आहे.',
    handoverSubtitle: 'उत्पादन निवडीपासून ते इन्स्टॉलेशन आणि सेवेपर्यंत आमची टीम तुमच्यासोबत राहते.',
    insideClinicalSupport: 'आमची वैद्यकीय मदत',
    raamedInField: 'क्षेत्रात रामेड',
    exploreRaamed: 'रामेड शोधा',
    mediaCentre: 'मीडिया सेंटर',
    talkToTeam: 'आमच्या टीमशी बोला',
    delhiHq: 'दिल्ली मुख्यालय',
    monSatHours: 'सोम-शनि, 9:00-18:00 IST',
    copyright: '© 2026 रामेड (RAAMED / RAMMED). सर्व हक्क राखीव.',
    patientMonitoring: 'रुग्ण देखरेख',
    surgicalSystems: 'सर्जिकल सिस्टीम',
    endoscopySystems: 'एंडोस्कोपी सिस्टीम',
    respiratoryCare: 'श्वसन काळजी',
    sterilizationReprocessing: 'निर्जंतुकीकरण',
    selectLanguage: 'भाषा निवडा',
    translateWithGoogle: 'पृष्ठाचे आपोआप भाषांतर करा',
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => undefined,
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('raamed_language') as Language
    if (saved && translations[saved]) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('raamed_language', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
