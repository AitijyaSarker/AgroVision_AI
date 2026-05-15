export const translations = {
  en: {
    nav: {
      home: 'Home',
      datasets: 'Datasets',
      about: 'About Us',
      contact: 'Contact Us',
      signUp: 'Sign Up',
      dashboard: 'Dashboard',
      signOut: 'Sign Out',
    },
    hero: {
      title: 'Agro Vision',
      subtitle: 'AI-Powered Crop Disease Detection for Farmers of Bangladesh',
      cta: 'Scan Your Crop',
    },
    about: {
      title: 'About Us',
      teamTitle: 'Team Agro Vision',
      roadmap: 'How It Works',
    },
    datasets: {
      title: 'Datasets',
      viewDataset: 'View Dataset',
    },
    contact: {
      title: 'Contact Us',
      name: 'Name',
      email: 'Email / Mobile',
      message: 'Message',
      submit: 'Submit',
      success: 'Thank you for contacting us!',
    },
    auth: {
      signUp: 'Sign Up',
      signIn: 'Sign In',
      asFarmer: 'Sign up as Farmer',
      asSpecialist: 'Sign up as Agri Specialist',
      phoneNumber: 'Phone Number',
      countryCode: 'Country Code',
      continue: 'Continue',
    },
    dashboard: {
      farmer: {
        title: 'Farmer Dashboard',
        scanCrop: 'Scan Your Crop',
        uploadImage: 'Upload Image',
        captureImage: 'Capture Image',
        aiChatbot: 'AI Chatbot',
        getHelp: 'Get Help from Specialist',
        findOffice: 'Find Nearest Agri Office',
        results: 'Detection Results',
        disease: 'Disease',
        confidence: 'Confidence',
        solution: 'Solution',
      },
      specialist: {
        title: 'Specialist Dashboard',
        notifications: 'Notifications',
        requests: 'Farmer Requests',
        accept: 'Accept',
        ignore: 'Ignore',
        chat: 'Chat',
        noRequests: 'No new requests',
      },
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success!',
    },
  },
  bn: {
    nav: {
      home: 'হোম',
      datasets: 'ডেটাসেট',
      about: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      signUp: 'সাইন আপ',
      dashboard: 'ড্যাশবোর্ড',
      signOut: 'সাইন আউট',
    },
    hero: {
      title: 'এগ্রো ভিশন',
      subtitle: 'বাংলাদেশের কৃষকদের জন্য AI-চালিত ফসলের রোগ সনাক্তকরণ',
      cta: 'আপনার ফসল স্ক্যান করুন',
    },
    about: {
      title: 'আমাদের সম্পর্কে',
      teamTitle: 'টিম এগ্রো ভিশন',
      roadmap: 'এটি কীভাবে কাজ করে',
    },
    datasets: {
      title: 'ডেটাসেট',
      viewDataset: 'ডেটাসেট দেখুন',
    },
    contact: {
      title: 'যোগাযোগ',
      name: 'নাম',
      email: 'ইমেইল / মোবাইল',
      message: 'বার্তা',
      submit: 'জমা দিন',
      success: 'আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ!',
    },
    auth: {
      signUp: 'সাইন আপ',
      signIn: 'সাইন ইন',
      asFarmer: 'কৃষক হিসাবে সাইন আপ করুন',
      asSpecialist: 'কৃষি বিশেষজ্ঞ হিসাবে সাইন আপ করুন',
      phoneNumber: 'মোবাইল নম্বর',
      countryCode: 'দেশের কোড',
      continue: 'চালিয়ে যান',
    },
    dashboard: {
      farmer: {
        title: 'কৃষক ড্যাশবোর্ড',
        scanCrop: 'আপনার ফসল স্ক্যান করুন',
        uploadImage: 'ছবি আপলোড করুন',
        captureImage: 'ছবি তুলুন',
        aiChatbot: 'AI চ্যাটবট',
        getHelp: 'বিশেষজ্ঞের সাহায্য নিন',
        findOffice: 'নিকটতম কৃষি অফিস খুঁজুন',
        results: 'সনাক্তকরণ ফলাফল',
        disease: 'রোগ',
        confidence: 'আস্থা',
        solution: 'সমাধান',
      },
      specialist: {
        title: 'বিশেষজ্ঞ ড্যাশবোর্ড',
        notifications: 'বিজ্ঞপ্তি',
        requests: 'কৃষকের অনুরোধ',
        accept: 'গ্রহণ করুন',
        ignore: 'উপেক্ষা করুন',
        chat: 'চ্যাট',
        noRequests: 'কোন নতুন অনুরোধ নেই',
      },
    },
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'একটি ত্রুটি ঘটেছে',
      success: 'সফল!',
    },
  },
}

export type Language = 'en' | 'bn'
export type TranslationKey = keyof typeof translations.en


