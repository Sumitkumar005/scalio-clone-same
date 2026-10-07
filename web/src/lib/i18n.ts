export const LANGUAGES = [
  { code: "en", flag: "🇬🇧", native: "English", english: "English" },
  { code: "hi", flag: "🇮🇳", native: "हिंदी", english: "Hindi" },
  { code: "gu", flag: "🇮🇳", native: "ગુજરાતી", english: "Gujarati" },
  { code: "ta", flag: "🇮🇳", native: "தமிழ்", english: "Tamil" },
  { code: "te", flag: "🇮🇳", native: "తెలుగు", english: "Telugu" },
  { code: "ml", flag: "🇮🇳", native: "മലയാളം", english: "Malayalam" },
  { code: "id", flag: "🇮🇩", native: "Bahasa Indonesia", english: "Indonesian" },
  { code: "tr", flag: "🇹🇷", native: "Türkçe", english: "Turkish" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

type Dict = {
  welcome: string;
  choose: string;
  google: string;
  email: string;
  phone: string;
  emailPrompt: string;
  sendLink: string;
  linkSent: string;
  or: string;
  back: string;
};

const en: Dict = {
  welcome: "Welcome to",
  choose: "Pick a way to continue",
  google: "Continue with Google",
  email: "Continue with email",
  phone: "Continue with phone",
  emailPrompt: "We'll email you a one-tap sign-in link",
  sendLink: "Email me a link",
  linkSent: "Check your inbox. The link expires in 1 hour.",
  or: "or",
  back: "Back",
};

// Machine-seeded; get native speakers to review before launch.
const dictionaries: Partial<Record<LangCode, Partial<Dict>>> = {
  en,
  hi: { welcome: "स्वागत है", choose: "आगे बढ़ने का तरीका चुनें", google: "Google से जारी रखें", email: "ईमेल से जारी रखें", phone: "फ़ोन से जारी रखें", sendLink: "मुझे लिंक भेजें", or: "या", back: "वापस" },
  ta: { welcome: "வரவேற்கிறோம்", google: "Google மூலம் தொடரவும்", email: "மின்னஞ்சல் மூலம் தொடரவும்" },
  id: { welcome: "Selamat datang di", choose: "Pilih cara melanjutkan", google: "Lanjutkan dengan Google", email: "Lanjutkan dengan email", phone: "Lanjutkan dengan telepon", or: "atau", back: "Kembali" },
  tr: { welcome: "Hoş geldiniz:", choose: "Devam etmek için bir yol seçin", google: "Google ile devam et", email: "E-posta ile devam et", phone: "Telefonla devam et", or: "veya", back: "Geri" },
};

export function t(lang: LangCode): Dict {
  return { ...en, ...dictionaries[lang] };
}
