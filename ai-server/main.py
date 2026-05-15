from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import numpy as np
import cv2

app = FastAPI(title="Agro Vision AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SOLUTIONS_EN = {
    "Healthy": "Your crop looks healthy. Continue balanced fertilization, proper irrigation, and regular field monitoring.",
    "Brown Spot": "Remove crop residues, use balanced fertilizers, and apply fungicides such as Propiconazole or Tricyclazole.",
    "Bacterial Blight": "Use resistant varieties, avoid overhead irrigation, and apply copper-based bactericides early.",
    "Leaf Blast": "Apply fungicides at early stages, use resistant varieties, and maintain proper plant spacing.",
    "Rice Blast": "Use systemic fungicides, improve drainage, and avoid excessive nitrogen fertilizer.",
    "Sheath Blight": "Apply fungicides, maintain proper spacing, and avoid prolonged waterlogging in the field.",
}

SOLUTIONS_BN = {
    "Healthy": "আপনার ফসল সুস্থ দেখাচ্ছে। সুষম সার, সঠিক সেচ এবং নিয়মিত পর্যবেক্ষণ চালিয়ে যান।",
    "Brown Spot": "ফসলের অবশিষ্টাংশ সরান, সুষম সার ব্যবহার করুন এবং প্রোপিকোনাজল বা ট্রাইসাইক্লাজল জাতীয় ফাঙ্গিসাইড প্রয়োগ করুন।",
    "Bacterial Blight": "প্রতিরোধী জাত ব্যবহার করুন, ওভারহেড সেচ এড়িয়ে চলুন এবং তামা-ভিত্তিক ব্যাকটেরিসাইড প্রয়োগ করুন।",
    "Leaf Blast": "প্রাথমিক পর্যায়ে ফাঙ্গিসাইড প্রয়োগ করুন, প্রতিরোধী জাত ব্যবহার করুন এবং গাছের মধ্যে সঠিক দূরত্ব রাখুন।",
    "Rice Blast": "সিস্টেমিক ফাঙ্গিসাইড ব্যবহার করুন, নিষ্কাশন উন্নত করুন এবং অতিরিক্ত নাইট্রোজেন সার এড়িয়ে চলুন।",
    "Sheath Blight": "ফাঙ্গিসাইড প্রয়োগ করুন, সঠিক দূরত্ব বজায় রাখুন এবং ক্ষেতে দীর্ঘদিন জল জমা হতে দেবেন না।",
}

DISEASE_BN = {
    "Healthy": "সুস্থ",
    "Brown Spot": "বাদামী দাগ রোগ",
    "Bacterial Blight": "ব্যাকটেরিয়াল ব্লাইট",
    "Leaf Blast": "পাতা ব্লাস্ট",
    "Rice Blast": "ধান ব্লাস্ট",
    "Sheath Blight": "শীথ ব্লাইট",
}


class DiseaseDetector:
    def __init__(self):
        self.disease_classes = [
            "Healthy",
            "Brown Spot",
            "Bacterial Blight",
            "Leaf Blast",
            "Rice Blast",
            "Sheath Blight",
        ]

    def _decode_image(self, image_bytes: bytes) -> np.ndarray:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image data")
        return img

    def _analyze_features(self, img: np.ndarray) -> dict:
        img = cv2.resize(img, (512, 512))
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        b, g, r = cv2.split(img)

        green_mask = cv2.inRange(hsv, (25, 40, 40), (90, 255, 255))
        brown_mask = cv2.inRange(hsv, (5, 50, 50), (25, 255, 220))
        yellow_mask = cv2.inRange(hsv, (15, 80, 80), (35, 255, 255))
        dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 60))

        total = img.shape[0] * img.shape[1]
        green_ratio = float(np.count_nonzero(green_mask)) / total
        brown_ratio = float(np.count_nonzero(brown_mask)) / total
        yellow_ratio = float(np.count_nonzero(yellow_mask)) / total
        dark_ratio = float(np.count_nonzero(dark_mask)) / total

        lesion_mask = cv2.bitwise_or(brown_mask, dark_mask)
        kernel = np.ones((3, 3), np.uint8)
        lesion_mask = cv2.morphologyEx(lesion_mask, cv2.MORPH_OPEN, kernel)
        contours, _ = cv2.findContours(lesion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        lesion_area = sum(cv2.contourArea(c) for c in contours if cv2.contourArea(c) > 8)
        lesion_score = lesion_area / total

        return {
            "green_ratio": green_ratio,
            "brown_ratio": brown_ratio,
            "yellow_ratio": yellow_ratio,
            "dark_ratio": dark_ratio,
            "lesion_score": lesion_score,
        }

    def _classify(self, features: dict) -> tuple:
        g = features["green_ratio"]
        br = features["brown_ratio"]
        y = features["yellow_ratio"]
        d = features["dark_ratio"]
        ls = features["lesion_score"]

        if g > 0.55 and br < 0.06 and y < 0.08 and ls < 0.04:
            return "Healthy", min(97.0, 88 + g * 12)

        if br > 0.14 or ls > 0.12:
            conf = min(94.0, 72 + (br + ls) * 80)
            if ls > 0.18 and br > 0.1:
                return "Brown Spot", conf
            if y > br:
                return "Leaf Blast", conf - 4
            return "Brown Spot", conf

        if y > 0.12 and g < 0.45:
            return "Leaf Blast", min(92.0, 70 + y * 60)

        if d > 0.1 and g < 0.4:
            return "Rice Blast", min(90.0, 68 + d * 50)

        if br > 0.08 and ls > 0.06:
            return "Bacterial Blight", min(88.0, 65 + ls * 80)

        if g > 0.35 and ls > 0.05:
            return "Sheath Blight", min(86.0, 62 + ls * 70)

        if br > y:
            return "Brown Spot", min(85.0, 60 + br * 100)

        return "Healthy", min(82.0, 55 + g * 30)

    def predict(self, image_bytes: bytes, language: str = "en") -> dict:
        try:
            img = self._decode_image(image_bytes)
            features = self._analyze_features(img)
            disease_name, confidence = self._classify(features)
            confidence = round(max(52.0, min(97.0, confidence)), 1)
            is_bn = language == "bn"
            solutions = SOLUTIONS_BN if is_bn else SOLUTIONS_EN

            return {
                "crop": "ধান" if is_bn else "Rice",
                "disease": DISEASE_BN.get(disease_name, disease_name) if is_bn else disease_name,
                "confidence": confidence,
                "solution": solutions.get(disease_name, "Consult a specialist."),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


detector = DiseaseDetector()


@app.get("/")
async def root():
    return {"message": "Agro Vision AI Server", "status": "running"}


@app.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
    language: str = Query("en"),
):
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file")
        result = detector.predict(image_bytes, language)
        return JSONResponse(content=result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    context: Optional[str] = None
    history: Optional[List[ChatMessage]] = None


def _rule_chat(message: str, language: str) -> str:
    message_lower = message.lower()
    rules = [
        (["brown spot", "বাদামী"], {
            "en": "Brown spot is fungal. Remove infected leaves, improve drainage, and apply Propiconazole fungicide per label.",
            "bn": "বাদামী দাগ ছত্রাকজনিত। সংক্রামিত পাতা সরান, নিষ্কাশন উন্নত করুন এবং লেবেল অনুযায়ী প্রোপিকোনাজল প্রয়োগ করুন।",
        }),
        (["blast", "ব্লাস্ট"], {
            "en": "Blast spreads in humid weather. Use resistant varieties and apply fungicides early.",
            "bn": "ব্লাস্ট আর্দ্র আবহাওয়ায় ছড়ায়। প্রতিরোধী জাত ও প্রাথমিক ফাঙ্গিসাইড ব্যবহার করুন।",
        }),
        (["bacterial", "ব্যাকটেরিয়া"], {
            "en": "For bacterial blight: resistant varieties, copper bactericides, avoid wet-field work.",
            "bn": "ব্যাকটেরিয়াল ব্লাইট: প্রতিরোধী জাত, তামা ব্যাকটেরিসাইড, ভেজা ক্ষেতে কাজ নয়।",
        }),
        (["rice", "ধান"], {
            "en": "For rice: balanced NPK, weekly scouting, act within 48h when spots appear.",
            "bn": "ধান: সুষম এনপিকে, সাপ্তাহিক পর্যবেক্ষণ, দাগ দেখা দিলে ৪৮ ঘণ্টায় ব্যবস্থা।",
        }),
        (["help", "সাহায্য", "hello", "হ্যালো"], {
            "en": "I help with crop diseases and treatments. Describe symptoms or use the crop scanner with a photo.",
            "bn": "ফসলের রোগ ও চিকিৎসায় সাহায্য করি। লক্ষণ বলুন বা স্ক্যানারে ছবি দিন।",
        }),
    ]
    for keys, resp in rules:
        if any(k in message_lower or k in message for k in keys):
            return resp.get(language, resp["en"])
    return {
        "en": "Describe symptoms or upload a crop photo in the scanner. For severe cases, visit the nearest agri office.",
        "bn": "লক্ষণ বর্ণনা করুন বা স্ক্যানারে ছবি দিন। গুরুতর হলে নিকটস্থ কৃষি অফিসে যান।",
    }.get(language, "Consult a specialist.")


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        language = request.language if request.language in ("en", "bn") else "en"
        response = _rule_chat(request.message, language)
        return JSONResponse(content={"response": response, "language": language})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
