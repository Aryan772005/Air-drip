export type Language = "en" | "hi";

export interface TranslationStrings {
  brandTitle: string;
  brandSubtitle: string;
  liveStation: string;
  selectStation: string;
  delhiNCR: string;
  otherMetros: string;
  diwaliAlertTag: string;
  smokeExplanation: string;
  viewTechnicalDetails: string;
  hideTechnicalDetails: string;
  rawPm25: string;
  stationLabel: string;
  cigarettesHeading: string;
  cigarettesSubtext: string;
  cigarettesFootnote: string;
  cigarettesUnit: string;
  whatShouldIDo: string;
  whatShouldIDoSub: string;
  sevenDayHeading: string;
  sevenDaySub: string;
  exploreMap: string;
  healthDefense: string;
  scrollExplore: string;
  weatherHeading: string;
  weatherTemp: string;
  weatherHumidity: string;
  weatherWind: string;
  scaleGood: string;
  scaleSatisfactory: string;
  scaleModerate: string;
  scalePoor: string;
  scaleVeryPoor: string;
  scaleSevere: string;
  cpcbScaleLabel: string;
  currentAirCondition: string;
  liveStream: string;
  heroHeadlineGood: string;
  heroHeadlineSatisfactory: string;
  heroHeadlineModerate: string;
  heroHeadlinePoor: string;
  heroHeadlineVeryPoor: string;
  heroHeadlineSevere: string;
  heroDescGood: string;
  heroDescSatisfactory: string;
  heroDescModerate: string;
  heroDescPoor: string;
  heroDescVeryPoor: string;
  heroDescSevere: string;
  exactAqiLabel: string;
  exactPm25Label: string;
  officialScaleCapped: string;
  safeLimitLabel: string;
  mlModelTeacherTitle: string;
  mlModelTeacherSub: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    brandTitle: "AIR DRIP // DIWALI-AQI",
    brandSubtitle: "Diwali Air Quality Guide for Families",
    liveStation: "Station",
    selectStation: "Select Station or City",
    delhiNCR: "Delhi NCR (10 Stations)",
    otherMetros: "Major Indian Metros (12 Cities)",
    diwaliAlertTag: "Diwali Smoke Alert",
    smokeExplanation:
      "Smoke from Diwali firecrackers is trapped close to the ground, so the pollution cannot escape.",
    viewTechnicalDetails: "View Technical Details & AI Explanation",
    hideTechnicalDetails: "Hide Technical Details & AI Explanation",
    rawPm25: "PM2.5 Level",
    stationLabel: "Monitoring Station",
    cigarettesHeading: "Cigarette Equivalent",
    cigarettesSubtext: "Breathing this air today is like smoking about",
    cigarettesFootnote: "Approximate estimate, based on Berkeley Earth's rule of thumb.",
    cigarettesUnit: "cigarettes per day",
    whatShouldIDo: "What Should I Do?",
    whatShouldIDoSub: "Simple, doctor-backed safety steps for you and your family right now.",
    sevenDayHeading: "7-Day Diwali Week Forecast",
    sevenDaySub: "Track day-by-day pollution trends before, during, and after Diwali night.",
    exploreMap: "Explore City Map",
    healthDefense: "Health Advice",
    scrollExplore: "Scroll to Explore",
    weatherHeading: "Real-Time Weather",
    weatherTemp: "Temperature",
    weatherHumidity: "Humidity",
    weatherWind: "Wind Speed",
    scaleGood: "Good",
    scaleSatisfactory: "Satisfactory",
    scaleModerate: "Moderate",
    scalePoor: "Poor",
    scaleVeryPoor: "Very Poor",
    scaleSevere: "Severe",
    cpcbScaleLabel: "Indian CPCB AQI Scale",
    currentAirCondition: "Current Air Condition",
    liveStream: "LIVE ATMOSPHERIC STREAM",
    heroHeadlineGood: "Clean & Fresh Air — Enjoy the Outdoors",
    heroHeadlineSatisfactory: "Acceptable Air — Safe for Most People",
    heroHeadlineModerate: "Moderate Pollution — Sensitive People Take Care",
    heroHeadlinePoor: "Unhealthy Air — Limit Prolonged Outdoor Time",
    heroHeadlineVeryPoor: "Very Dangerous — Avoid Going Outside Today",
    heroHeadlineSevere: "Severe Emergency — Stay Indoors & Keep Windows Shut",
    heroDescGood: "Air quality is healthy. Perfect time for outdoor walks, exercise, and children's playtime.",
    heroDescSatisfactory: "Air quality is acceptable. Minor discomfort possible for unusually sensitive individuals.",
    heroDescModerate: "May cause slight breathing discomfort to children, elderly, and people with asthma.",
    heroDescPoor: "Pollution levels are elevated. Avoid strenuous outdoor activities and wear a mask near traffic.",
    heroDescVeryPoor: "Dense smoke and heavy particulate buildup. High risk of cough, eye irritation, and asthma attacks.",
    heroDescSevere: "Hazardous smoke blanket. Healthy people will experience breathing issues; high risk for heart and lung patients.",
    exactAqiLabel: "Exact Calculated AQI",
    exactPm25Label: "Exact PM2.5 Level",
    officialScaleCapped: "Official CPCB Scale Ceiling",
    safeLimitLabel: "Safe Standard",
    mlModelTeacherTitle: "How Our AI / Machine Learning Model Works",
    mlModelTeacherSub: "Learn how LightGBM Quantile ML predicts Diwali smog with 95% higher accuracy than simple averages.",
  },
  hi: {
    brandTitle: "हवा-AI // दिवाली-AQI",
    brandSubtitle: "भारतीय परिवारों के लिए सरल वायु गुणवत्ता गाइड",
    liveStation: "स्टेशन",
    selectStation: "स्टेशन या शहर चुनें",
    delhiNCR: "दिल्ली एनसीआर (10 स्टेशन)",
    otherMetros: "अन्य प्रमुख शहर (12 मेट्रो)",
    diwaliAlertTag: "दिवाली धुआं चेतावनी",
    smokeExplanation:
      "दिवाली के पटाखों का धुआं जमीन के पास फंसा हुआ है, इसलिए प्रदूषण बाहर नहीं निकल पा रहा है।",
    viewTechnicalDetails: "तकनीकी विवरण और AI मॉडल समझें",
    hideTechnicalDetails: "तकनीकी विवरण छुपाएं",
    rawPm25: "PM2.5 स्तर",
    stationLabel: "निगरानी स्टेशन",
    cigarettesHeading: "सिगरेट के बराबर नुकसान",
    cigarettesSubtext: "आज इस हवा में सांस लेना लगभग",
    cigarettesFootnote: "अनुमानित गणना, बर्कले अर्थ (Berkeley Earth) के शोध नियम पर आधारित।",
    cigarettesUnit: "सिगरेट पीने के बराबर है",
    whatShouldIDo: "मुझे क्या करना चाहिए?",
    whatShouldIDoSub: "आपके और आपके परिवार की सुरक्षा के लिए डॉक्टरों द्वारा सुझाई गई आसान सलाह।",
    sevenDayHeading: "दिवाली सप्ताह का 7-दिवसीय पूर्वानुमान",
    sevenDaySub: "दिवाली से पहले, दिवाली की रात और बाद के दिनों का दैनिक वायु प्रदूषण स्तर।",
    exploreMap: "नक्शा देखें",
    healthDefense: "स्वास्थ्य सलाह",
    scrollExplore: "नीचे स्क्रॉल करें",
    weatherHeading: "वर्तमान मौसम",
    weatherTemp: "तापमान",
    weatherHumidity: "नमी",
    weatherWind: "हवा की गति",
    scaleGood: "अच्छा",
    scaleSatisfactory: "संतोषजनक",
    scaleModerate: "मध्यम",
    scalePoor: "खराब",
    scaleVeryPoor: "बहुत खराब",
    scaleSevere: "गंभीर",
    cpcbScaleLabel: "भारतीय CPCB AQI पैमाना",
    currentAirCondition: "हवा की वर्तमान स्थिति",
    liveStream: "लाइव वायुमंडलीय स्ट्रीम",
    heroHeadlineGood: "हवा साफ और ताज़ी है — बाहर खुलकर घूमें",
    heroHeadlineSatisfactory: "हवा संतोषजनक है — अधिकांश लोगों के लिए सुरक्षित",
    heroHeadlineModerate: "मध्यम प्रदूषण — संवेदनशील लोग थोड़ा ध्यान रखें",
    heroHeadlinePoor: "हवा खराब है — बाहर ज्यादा समय बिताने से बचें",
    heroHeadlineVeryPoor: "बहुत खतरनाक हवा — आज घर से बाहर निकलने से बचें",
    heroHeadlineSevere: "अत्यधिक गंभीर स्थिति — घर के अंदर रहें, खिड़कियां बंद रखें",
    heroDescGood: "हवा बिल्कुल स्वच्छ है। सुबह की सैर, खेलकूद और बच्चों के बाहर खेलने के लिए सबसे उत्तम समय।",
    heroDescSatisfactory: "हवा सामान्य है। केवल अत्यधिक संवेदनशील लोगों को हल्की परेशानी हो सकती है।",
    heroDescModerate: "हवा में हल्का प्रदूषण है। बच्चों, बुजुर्गों और दमा रोगियों को थोड़ी सावधानी बरतनी चाहिए।",
    heroDescPoor: "प्रदूषण का स्तर बढ़ गया है। बाहर ज्यादा दौड़-भाग न करें और भीड़भाड़ में मास्क लगाएं।",
    heroDescVeryPoor: "आसमान में घना धुआं छाया हुआ है। खांसी, आंखों में जलन और सांस फूलने का गंभीर खतरा है।",
    heroDescSevere: "जहरीला धुआं फैला है। स्वस्थ लोगों को भी सांस लेने में तकलीफ होगी; घर में रहें और खिड़कियां बंद रखें।",
    exactAqiLabel: "सटीक गणना किया गया AQI",
    exactPm25Label: "सटीक PM2.5 स्तर",
    officialScaleCapped: "आधिकारिक CPCB अधिकतम पैमाना",
    safeLimitLabel: "सुरक्षित मानक",
    mlModelTeacherTitle: "हमारा AI / मशीन लर्निंग मॉडल कैसे काम करता है?",
    mlModelTeacherSub: "जानिए कैसे LightGBM मॉडल आम औसत की तुलना में 95% अधिक सटीकता से दिवाली के धुएं का पूर्वानुमान लगाता है।",
  },
};

export interface HealthAdviceItem {
  icon: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  type: "mask" | "windows" | "walks" | "care" | "purifier" | "outdoor" | "hydration";
}

export function getHealthAdviceForLevel(category: string): HealthAdviceItem[] {
  if (category === "Severe" || category === "Very Poor") {
    return [
      {
        icon: "😷",
        type: "mask",
        titleEn: "Wear an N95 Mask",
        titleHi: "N95 मास्क जरूर पहनें",
        descEn: "Normal cloth masks don't stop toxic PM2.5 smoke. Wear a well-fitted N95 mask whenever stepping outdoors.",
        descHi: "साधारण कपड़े का मास्क जहरीले धुएं को नहीं रोकता। बाहर जाना जरूरी हो तो N95 मास्क ही लगाएं।",
      },
      {
        icon: "🪟",
        type: "windows",
        titleEn: "Keep Windows & Doors Closed",
        titleHi: "खिड़कियां और दरवाजे बंद रखें",
        descEn: "Block outdoor smog from entering bedrooms. Use wet towels under door gaps to seal smoky air.",
        descHi: "बाहरी जहरीले धुएं को घर में आने से रोकें। दरवाजों के नीचे की खाली जगह को कपड़े से बंद करें।",
      },
      {
        icon: "🚷",
        type: "walks",
        titleEn: "Stop Morning Walks & Outdoor Play",
        titleHi: "मॉर्निंग वॉक और बच्चों का बाहर खेलना बंद करें",
        descEn: "Cold morning air holds the heaviest smoke near the ground. Avoid runs, walks, and park visits.",
        descHi: "सुबह की ठंड में धुआं जमीन के सबसे पास रहता है। जॉगिंग, सैर और बच्चों को पार्क भेजना तुरंत रोकें।",
      },
      {
        icon: "🩺",
        type: "care",
        titleEn: "Extra Care for Elders & Patients",
        titleHi: "बुजुर्गों, गर्भवती महिलाओं और मरीजों का खास ध्यान",
        descEn: "Keep inhalers, nebulizers, and heart medications ready. Consult a doctor immediately if chest feels tight.",
        descHi: "दमा और दिल के मरीज अपनी दवाएं व इनहेलर पास रखें। सीने में भारीपन या सांस फूलने पर तुरंत डॉक्टर से संपर्क करें।",
      },
      {
        icon: "💨",
        type: "purifier",
        titleEn: "Use Air Purifier if Available",
        titleHi: "संभव हो तो एयर प्यूरीफायर चलाएं",
        descEn: "Run air purifier on high speed in closed bedrooms. If unavailable, stay in the most enclosed interior room.",
        descHi: "कमरे में एयर प्यूरीफायर चलाएं। यदि प्यूरीफायर न हो, तो सबसे अंदर वाले बंद कमरे में रहें।",
      },
    ];
  }

  if (category === "Poor" || category === "Moderate") {
    return [
      {
        icon: "😷",
        type: "mask",
        titleEn: "Wear Mask in Heavy Traffic",
        titleHi: "धूल और ट्रैफिक में मास्क पहनें",
        descEn: "Put on a mask if commuting through busy intersections, construction sites, or dusty roads.",
        descHi: "व्यस्त सड़कों, चौराहों और धूल भरे इलाकों से गुजरते समय मास्क का इस्तेमाल करें।",
      },
      {
        icon: "🚷",
        type: "walks",
        titleEn: "Shift Walks to Sunny Afternoon",
        titleHi: "सुबह की जगह दोपहर में टहलें",
        descEn: "Pollution is highest in early morning and late night. Take your walk between 12 PM and 4 PM when sun disperses smoke.",
        descHi: "सुबह-शाम प्रदूषण सबसे ज्यादा होता है। दोपहर 12 से 4 बजे के बीच टहलना ज्यादा सुरक्षित है।",
      },
      {
        icon: "💧",
        type: "hydration",
        titleEn: "Drink Warm Water Frequently",
        titleHi: "पर्याप्त गुनगुना पानी पिएं",
        descEn: "Staying hydrated flushes out trapped toxins from your throat and keeps airways clear.",
        descHi: "दिनभर गुनगुना पानी पीते रहें। इससे गले की खराश कम होती है और शरीर से टॉक्सिन्स बाहर निकलते हैं।",
      },
      {
        icon: "🩺",
        type: "care",
        titleEn: "Asthma Patients Stay Alert",
        titleHi: "अस्थमा व एलर्जी मरीज सतर्क रहें",
        descEn: "Keep your rescue inhaler handy when going outside, as cooler evening air can trigger sudden coughing.",
        descHi: "शाम की ठंडी हवा से खांसी हो सकती है। इनहेलर पास रखें और धूल-धुएं से बचें।",
      },
    ];
  }

  // Good or Satisfactory
  return [
    {
      icon: "🌳",
      type: "outdoor",
      titleEn: "Enjoy Outdoor Sports & Exercise",
      titleHi: "बाहरी खेलकूद और व्यायाम का आनंद लें",
      descEn: "Air quality is safe and clean. Perfect time for running, cycling, playing sports, and park walks.",
      descHi: "हवा साफ और सुरक्षित है। दौड़ने, साइकिल चलाने, बच्चों के खेलने और पार्क जाने का बेहतरीन समय है।",
    },
    {
      icon: "🪟",
      type: "windows",
      titleEn: "Open Windows for Fresh Air",
      titleHi: "खिड़कियां खोलकर ताजी हवा आने दें",
      descEn: "Ventilate your home naturally to refresh indoor oxygen levels during daytime hours.",
      descHi: "दिन के समय घर की खिड़कियां और बालकनी खोलें ताकि ताजी और स्वच्छ हवा अंदर आ सके।",
    },
    {
      icon: "🚶",
      type: "walks",
      titleEn: "Great Conditions for Morning Walks",
      titleHi: "सुबह की सैर के लिए आदर्श मौसम",
      descEn: "Seniors and children can spend unlimited time outdoors with regular hydration.",
      descHi: "बुजुर्ग और बच्चे बिना किसी चिंता के बाहर टहल सकते हैं और स्वच्छ वातावरण का लाभ उठा सकते हैं।",
    },
    {
      icon: "🩺",
      type: "care",
      titleEn: "No Special Restrictions Needed",
      titleHi: "किसी खास सावधानी की जरूरत नहीं",
      descEn: "Zero respiratory threat detected. Normal daily routines can be followed freely.",
      descHi: "हवा में कोई प्रदूषण खतरा नहीं है। आप सामान्य दिनचर्या का बिना किसी डर के पालन कर सकते हैं।",
    },
  ];
}

