
// geminiService.ts
// Mock implementation for Gemini/Google GenAI calls.
// This provides fallback responses when the real API is not available.

// Initialize Gemini AI - mock implementation
const getGeminiAI = () => {
  return null; // Always return null for mock implementation
};

const getGeminiModel = () => {
  return null; // Always return null for mock implementation
};

export const detectCropDisease = async (_base64Image: string, _lang: 'en' | 'bn') => {
  // Mock implementation for testing
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  // Mock disease detection results with translations
  const mockResults = [
    {
      diseaseName: { en: 'Leaf Blight', bn: 'পাতা পচা' },
      cropName: { en: 'Rice', bn: 'ধান' },
      confidence: 0.87,
      description: { 
        en: 'Fungal infection causing brown spots on leaves. Common in humid conditions.',
        bn: 'পাতায় বাদামী দাগ সৃষ্টিকারী ছত্রাকজনিত সংক্রমণ। আর্দ্র পরিবেশে সাধারণ।'
      },
      solution: {
        en: [
          'Apply fungicide spray immediately',
          'Remove affected leaves',
          'Improve air circulation around plants',
          'Avoid overhead watering'
        ],
        bn: [
          'অবিলম্বে ছত্রাকনাশক স্প্রে প্রয়োগ করুন',
          'আক্রান্ত পাতা অপসারণ করুন',
          'গাছের চারপাশে বায়ু চলাচল উন্নত করুন',
          'উপর থেকে পানি দেওয়া এড়িয়ে চলুন'
        ]
      },
      prevention: {
        en: [
          'Use disease-resistant varieties',
          'Maintain proper plant spacing',
          'Avoid working with wet plants',
          'Apply preventive fungicide in high-risk periods'
        ],
        bn: [
          'রোগ প্রতিরোধী জাত ব্যবহার করুন',
          'গাছের মধ্যে সঠিক দূরত্ব বজায় রাখুন',
          'ভেজা গাছ নিয়ে কাজ করা এড়িয়ে চলুন',
          'উচ্চ ঝুঁকি সময়ে প্রতিরোধক ছত্রাকনাশক প্রয়োগ করুন'
        ]
      }
    },
    {
      diseaseName: { en: 'Powdery Mildew', bn: 'পাউডারি মিলডিউ' },
      cropName: { en: 'Wheat', bn: 'গম' },
      confidence: 0.92,
      description: { 
        en: 'White powdery coating on leaves caused by fungal spores.',
        bn: 'ছত্রাকজনিত স্পোর দ্বারা পাতায় সাদা পাউডারি আবরণ।'
      },
      solution: {
        en: [
          'Spray with sulfur-based fungicide',
          'Increase air circulation',
          'Reduce humidity around plants',
          'Prune affected areas'
        ],
        bn: [
          'সালফার ভিত্তিক ছত্রাকনাশক দিয়ে স্প্রে করুন',
          'বায়ু চলাচল বাড়ান',
          'গাছের চারপাশে আর্দ্রতা কমান',
          'আক্রান্ত এলাকা ছাঁটাই করুন'
        ]
      },
      prevention: {
        en: [
          'Plant resistant varieties',
          'Avoid overhead irrigation',
          'Space plants properly for air flow',
          'Monitor humidity levels'
        ],
        bn: [
          'প্রতিরোধী জাত রোপণ করুন',
          'উপর থেকে সেচ এড়িয়ে চলুন',
          'বায়ু চলাচলের জন্য গাছের দূরত্ব ঠিক রাখুন',
          'আর্দ্রতার মাত্রা নিরীক্ষণ করুন'
        ]
      }
    },
    {
      diseaseName: { en: 'Bacterial Spot', bn: 'ব্যাকটেরিয়াল স্পট' },
      cropName: { en: 'Tomato', bn: 'টমেটো' },
      confidence: 0.78,
      description: { 
        en: 'Small dark spots on leaves and fruits caused by bacterial infection.',
        bn: 'ব্যাকটেরিয়াল সংক্রমণের কারণে পাতা ও ফলে ছোট কালো দাগ।'
      },
      solution: {
        en: [
          'Apply copper-based bactericide',
          'Remove infected plant parts',
          'Improve drainage',
          'Avoid working with wet plants'
        ],
        bn: [
          'কপার ভিত্তিক ব্যাকটেরিয়ানাশক প্রয়োগ করুন',
          'সংক্রামিত গাছের অংশ অপসারণ করুন',
          'নিষ্কাশন উন্নত করুন',
          'ভেজা গাছ নিয়ে কাজ করা এড়িয়ে চলুন'
        ]
      },
      prevention: {
        en: [
          'Use certified disease-free seeds',
          'Rotate crops annually',
          'Avoid overhead watering',
          'Maintain proper plant spacing'
        ],
        bn: [
          'প্রত্যয়িত রোগমুক্ত বীজ ব্যবহার করুন',
          'বার্ষিক ফসল পরিবর্তন করুন',
          'উপর থেকে পানি দেওয়া এড়িয়ে চলুন',
          'গাছের মধ্যে সঠিক দূরত্ব বজায় রাখুন'
        ]
      }
    }
  ];

  const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
  
  // Return result in the requested language
  return {
    diseaseName: randomResult.diseaseName[_lang],
    cropName: randomResult.cropName[_lang],
    confidence: randomResult.confidence,
    description: randomResult.description[_lang],
    solution: randomResult.solution[_lang],
    prevention: randomResult.prevention[_lang]
  };
};

export const getChatResponse = async (history: { role: string, content: string }[], userInput: string, lang: 'en' | 'bn') => {
  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_ACTUAL_API_KEY_HERE') {
      // Fallback to enhanced mock responses if API key not configured
      return getEnhancedMockResponse(userInput, lang);
    }

    const model = getGeminiModel();
    if (!model) {
      // Fallback if model initialization failed
      return getEnhancedMockResponse(userInput, lang);
    }

    // Create agricultural expertise system prompt
    const systemPrompt = lang === 'en' ?
      `You are AgroVision AI, an expert agricultural assistant specializing in crop disease detection, farming practices, and agricultural advice for Bangladesh farmers.

Your expertise includes:
- Crop disease identification and treatment
- Soil health and fertility management
- Pest and weed control methods
- Irrigation and water management
- Fertilizer recommendations
- Weather impact on crops
- Organic farming practices
- Bangladesh-specific crops (rice, jute, tea, wheat, potato, vegetables)
- Seasonal farming advice
- Sustainable agriculture practices

Guidelines:
- Provide practical, actionable advice
- Consider Bangladesh's climate and farming conditions
- Suggest both traditional and modern farming methods
- Emphasize sustainable and eco-friendly practices
- Be encouraging and supportive to farmers
- Use simple, clear language
- If unsure about something, suggest consulting local agricultural extension officers
- Keep responses concise but informative (2-4 sentences)

Always respond in English unless the user specifically asks in Bengali.` :

      `আপনি AgroVision AI, বাংলাদেশের কৃষকদের জন্য ফসলের রোগ নির্ণয়, কৃষি পদ্ধতি এবং কৃষি পরামর্শে বিশেষজ্ঞ একটি কৃষি সহায়ক।

আপনার দক্ষতা অন্তর্ভুক্ত:
- ফসলের রোগ শনাক্তকরণ এবং চিকিৎসা
- মাটির স্বাস্থ্য এবং উর্বরতা ব্যবস্থাপনা
- কীট এবং আগাছা নিয়ন্ত্রণ পদ্ধতি
- সেচ এবং পানি ব্যবস্থাপনা
- সার সুপারিশ
- আবহাওয়ার ফসলে প্রভাব
- জৈব কৃষি পদ্ধতি
- বাংলাদেশ-নির্দিষ্ট ফসল (ধান, পাট, চা, গম, আলু, শাকসবজি)
- ঋতু অনুযায়ী কৃষি পরামর্শ
- টেকসই কৃষি পদ্ধতি

নির্দেশনা:
- ব্যবহারিক, কার্যকর পরামর্শ প্রদান করুন
- বাংলাদেশের আবহাওয়া এবং কৃষি অবস্থা বিবেচনা করুন
- ঐতিহ্যবাহী এবং আধুনিক কৃষি পদ্ধতি উভয়ই সুপারিশ করুন
- টেকসই এবং পরিবেশবান্ধব অনুশীলনের উপর জোর দিন
- কৃষকদের উৎসাহিত এবং সমর্থন করুন
- সহজ, স্পষ্ট ভাষা ব্যবহার করুন
- যদি কোন কিছু নিয়ে অনিশ্চিত হন, স্থানীয় কৃষি সম্প্রসারণ কর্মকর্তাদের সাথে পরামর্শ করার পরামর্শ দিন
- প্রতিক্রিয়াগুলি সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ রাখুন (২-৪ বাক্য)

সর্বদা বাংলায় প্রতিক্রিয়া দিন।`;

    // Build conversation context
    let conversationContext = systemPrompt + "\n\n";

    // Add recent conversation history (last 5 exchanges to avoid token limits)
    const recentHistory = history.slice(-10); // Last 10 messages
    recentHistory.forEach(msg => {
      conversationContext += `${msg.role === 'user' ? 'Farmer' : 'Assistant'}: ${msg.content}\n`;
    });

    conversationContext += `Farmer: ${userInput}\nAssistant:`;

    const result = await model.generateContent(conversationContext);
    const response = result.response;
    let text = response.text().trim();

    // Clean up the response
    text = text.replace(/^Assistant:\s*/i, '').trim();

    // If response is too long, truncate it
    if (text.length > 500) {
      text = text.substring(0, 500) + '...';
    }

    return text;

  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to enhanced mock response
    return getEnhancedMockResponse(userInput, lang);
  }
};

// Enhanced mock responses for when API is not available
const getEnhancedMockResponse = (userInput: string, lang: 'en' | 'bn'): string => {
  const input = userInput.toLowerCase();

  if (lang === 'en') {
    // English responses based on keywords
    if (input.includes('rice') || input.includes('paddy') || input.includes('ধান')) {
      return "For rice cultivation in Bangladesh, ensure proper water management during the vegetative stage. Use balanced fertilizers (NPK) and watch for common diseases like bacterial blight. Consider using resistant varieties like BRRI dhan varieties for better yield.";
    }
    if (input.includes('disease') || input.includes('sick') || input.includes('yellow') || input.includes('spot')) {
      return "Crop diseases can be caused by fungi, bacteria, or viruses. Check for symptoms like discoloration, spots, or wilting. For treatment, remove affected parts, apply appropriate fungicides, and improve air circulation. Consult your local agricultural office for specific diagnosis.";
    }
    if (input.includes('fertilizer') || input.includes('manure') || input.includes('সার')) {
      return "Use organic fertilizers like compost and vermicompost for sustainable farming. Chemical fertilizers should be applied based on soil testing results. For rice, apply urea in 3 splits, and maintain proper NPK balance to avoid nutrient deficiencies.";
    }
    if (input.includes('water') || input.includes('irrigation') || input.includes('সেচ')) {
      return "Proper irrigation is crucial for crop health. For rice, maintain 5-10 cm water level during vegetative stage. Avoid overwatering which can lead to root rot. Consider drip irrigation for water-efficient farming in Bangladesh.";
    }
    if (input.includes('pest') || input.includes('insect') || input.includes('কীট')) {
      return "Integrated Pest Management (IPM) is recommended. Use neem oil, beneficial insects, and crop rotation. For severe infestations, consider biological control methods before chemical pesticides. Regular field monitoring helps early detection.";
    }
    if (input.includes('soil') || input.includes('মাটি')) {
      return "Soil health is fundamental for good crops. Test your soil pH and nutrient levels regularly. Most Bangladesh soils need lime for acidity correction. Add organic matter through compost to improve soil structure and fertility.";
    }
    if (input.includes('weather') || input.includes('rain') || input.includes('climate')) {
      return "Bangladesh's monsoon climate affects crop planning. Plant rice during monsoon season (June-August). Be prepared for floods and cyclones. Climate-resilient crop varieties are recommended for changing weather patterns.";
    }

    // Default responses
    const defaultResponses = [
      "That's a great question about farming! For Bangladesh agriculture, consider the local climate and soil conditions. What specific crop or issue are you dealing with?",
      "Sustainable farming practices are essential in Bangladesh. Focus on soil health, water conservation, and integrated pest management. How can I help with your specific farming needs?",
      "Crop rotation, organic fertilizers, and proper irrigation are key to successful farming. Each region in Bangladesh has unique challenges - tell me more about your location and crops.",
      "Modern farming combines traditional wisdom with new technology. Consider using mobile apps for weather forecasts and disease identification. What aspect of farming interests you most?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  } else {
    // Bengali responses
    if (input.includes('rice') || input.includes('paddy') || input.includes('ধান')) {
      return "বাংলাদেশে ধান চাষের জন্য vegetative পর্যায়ে সঠিক পানি ব্যবস্থাপনা নিশ্চিত করুন। ভারসাম্যপূর্ণ সার (NPK) ব্যবহার করুন এবং ব্যাকটেরিয়াল ব্লাইটের মতো সাধারণ রোগের জন্য সতর্ক থাকুন। BRRI ধান জাতগুলো উচ্চ ফলনের জন্য বিবেচনা করুন।";
    }
    if (input.includes('disease') || input.includes('sick') || input.includes('yellow') || input.includes('spot') || input.includes('রোগ')) {
      return "ফসলের রোগ ছত্রাক, ব্যাকটেরিয়া বা ভাইরাস দ্বারা হতে পারে। রঙ পরিবর্তন, দাগ বা মুদ্রার মতো লক্ষণগুলো পরীক্ষা করুন। চিকিৎসার জন্য আক্রান্ত অংশ অপসারণ করুন, উপযুক্ত ছত্রাকনাশক প্রয়োগ করুন এবং বায়ু চলাচল উন্নত করুন।";
    }
    if (input.includes('fertilizer') || input.includes('manure') || input.includes('সার')) {
      return "টেকসই কৃষির জন্য কম্পোস্ট এবং ভার্মিকম্পোস্টের মতো জৈব সার ব্যবহার করুন। মাটি পরীক্ষার ফলাফলের ভিত্তিতে রাসায়নিক সার প্রয়োগ করুন। ধানের জন্য ইউরিয়া ৩ ভাগে প্রয়োগ করুন এবং NPK ভারসাম্য বজায় রাখুন।";
    }
    if (input.includes('water') || input.includes('irrigation') || input.includes('সেচ')) {
      return "ফসলের স্বাস্থ্যের জন্য সঠিক সেচ অত্যন্ত গুরুত্বপূর্ণ। ধানের জন্য vegetative পর্যায়ে ৫-১০ সেমি পানির স্তর বজায় রাখুন। রুট রট এড়াতে অতিরিক্ত পানি দেওয়া এড়িয়ে চলুন। বাংলাদেশে পানি সাশ্রয়ী কৃষির জন্য ড্রিপ ইরিগেশন বিবেচনা করুন।";
    }
    if (input.includes('pest') || input.includes('insect') || input.includes('কীট')) {
      return "সমন্বিত কীট ব্যবস্থাপনা (IPM) সুপারিশ করা হয়। নিম তেল, উপকারী পোকা এবং ফসল পরিবর্তন ব্যবহার করুন। গুরুতর আক্রমণের জন্য রাসায়নিক কীটনাশকের আগে জৈব নিয়ন্ত্রণ পদ্ধতি বিবেচনা করুন।";
    }
    if (input.includes('soil') || input.includes('মাটি')) {
      return "ভাল ফসলের জন্য মাটির স্বাস্থ্য মৌলিক। নিয়মিতভাবে মাটির pH এবং পুষ্টি স্তর পরীক্ষা করুন। বাংলাদেশের বেশিরভাগ মাটিতে অম্লতা সংশোধনের জন্য চুন প্রয়োজন। মাটির গঠন এবং উর্বরতা উন্নত করতে কম্পোস্টের মাধ্যমে জৈব পদার্থ যোগ করুন।";
    }
    if (input.includes('weather') || input.includes('rain') || input.includes('climate') || input.includes('আবহাওয়া')) {
      return "বাংলাদেশের বর্ষাকালীন আবহাওয়া ফসল পরিকল্পনাকে প্রভাবিত করে। বর্ষাকালে (জুন-আগস্ট) ধান রোপণ করুন। বন্যা এবং ঘূর্ণিঝড়ের জন্য প্রস্তুত থাকুন। পরিবর্তনশীল আবহাওয়ার জন্য জলবায়ু-সহনশীল ফসলের জাত সুপারিশ করা হয়।";
    }

    // Default Bengali responses
    const defaultResponses = [
      "কৃষি সম্পর্কে এটি একটি দুর্দান্ত প্রশ্ন! বাংলাদেশের কৃষির জন্য স্থানীয় আবহাওয়া এবং মাটির অবস্থা বিবেচনা করুন। আপনি কোন নির্দিষ্ট ফসল বা সমস্যার সাথে কাজ করছেন?",
      "বাংলাদেশে টেকসই কৃষি অনুশীলন অত্যন্ত গুরুত্বপূর্ণ। মাটির স্বাস্থ্য, পানি সংরক্ষণ এবং সমন্বিত কীট ব্যবস্থাপনার উপর ফোকাস করুন। আপনার নির্দিষ্ট কৃষি প্রয়োজনে কীভাবে সাহায্য করতে পারি?",
      "ফসল পরিবর্তন, জৈব সার এবং সঠিক সেচ কৃষির সাফল্যের চাবিকাঠি। বাংলাদেশের প্রতিটি অঞ্চলের অনন্য চ্যালেঞ্জ রয়েছে - আপনার অবস্থান এবং ফসল সম্পর্কে আরও বলুন।",
      "আধুনিক কৃষি ঐতিহ্যবাহী জ্ঞানকে নতুন প্রযুক্তির সাথে মিলিত করে। আবহাওয়া পূর্বাভাস এবং রোগ শনাক্তকরণের জন্য মোবাইল অ্যাপ ব্যবহার বিবেচনা করুন। কৃষির কোন দিকটি আপনাকে সবচেয়ে বেশি আগ্রহী করে?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
};
