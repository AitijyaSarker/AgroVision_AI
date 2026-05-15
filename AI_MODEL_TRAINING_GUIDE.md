# 🤖 AI Model Training Guide for Agro Vision

## Quick Start: Train Your Disease Detection Model

### Step 1: Download Datasets

**Recommended Kaggle Datasets:**

1. **Plant Village Dataset** (Most Popular)
   - Link: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
   - Classes: 38 plant disease classes
   - Size: ~3GB
   - Format: Organized folders by disease

2. **Rice Leaf Disease Dataset**
   - Link: https://www.kaggle.com/datasets/minhhuy2810/rice-diseases-image-dataset
   - Classes: 3 rice diseases + healthy
   - Size: ~500MB
   - Perfect for Bangladesh focus

3. **New Plant Diseases Dataset**
   - Link: https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset
   - Classes: 15 disease classes
   - Size: ~1GB

### Step 2: Set Up Training Environment

```bash
cd ai-server
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

pip install tensorflow opencv-python pillow numpy pandas scikit-learn matplotlib
```

### Step 3: Train Model (Quick Version)

Create `ai-server/train_model.py`:

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from pathlib import Path
import cv2

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20
DATA_DIR = "path/to/your/dataset"  # Update this

# Data loading and preprocessing
def load_data(data_dir):
    """Load images from directory structure: data_dir/class_name/images"""
    images = []
    labels = []
    class_names = sorted([d.name for d in Path(data_dir).iterdir() if d.is_dir()])
    
    for class_idx, class_name in enumerate(class_names):
        class_dir = Path(data_dir) / class_name
        for img_path in class_dir.glob("*.jpg"):
            img = cv2.imread(str(img_path))
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = img.astype(np.float32) / 255.0
            images.append(img)
            labels.append(class_idx)
    
    return np.array(images), np.array(labels), class_names

# Build CNN Model
def create_model(num_classes):
    model = keras.Sequential([
        layers.Conv2D(32, 3, activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        layers.MaxPooling2D(),
        layers.Conv2D(64, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(128, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Main training
if __name__ == "__main__":
    print("Loading data...")
    images, labels, class_names = load_data(DATA_DIR)
    
    print(f"Loaded {len(images)} images, {len(class_names)} classes")
    print(f"Classes: {class_names}")
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        images, labels, test_size=0.2, random_state=42
    )
    
    # Create and train model
    model = create_model(len(class_names))
    model.summary()
    
    print("Training model...")
    history = model.fit(
        X_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(X_test, y_test),
        verbose=1
    )
    
    # Save model
    model.save('model/disease_detector.h5')
    
    # Save class names
    import json
    with open('model/class_names.json', 'w') as f:
        json.dump(class_names, f)
    
    print("Model saved to model/disease_detector.h5")
    print(f"Final accuracy: {history.history['accuracy'][-1]:.2%}")
```

### Step 4: Update FastAPI Server

Update `ai-server/main.py`:

```python
# Add at top
import json
from pathlib import Path

# Update DiseaseDetector class
class DiseaseDetector:
    def __init__(self):
        # Load trained model
        model_path = Path(__file__).parent / 'model' / 'disease_detector.h5'
        if model_path.exists():
            self.model = tf.keras.models.load_model(str(model_path))
            with open(Path(__file__).parent / 'model' / 'class_names.json', 'r') as f:
                self.disease_classes = json.load(f)
            print(f"✅ Model loaded: {len(self.disease_classes)} classes")
        else:
            self.model = None
            self.disease_classes = ['Healthy', 'Brown Spot', 'Bacterial Blight']
            print("⚠️ Using mock model (train_model.py to train real model)")
    
    def predict(self, image_bytes: bytes, language: str = 'en') -> dict:
        processed_img = self.preprocess_image(image_bytes)
        
        if self.model:
            # Real prediction
            predictions = self.model.predict(processed_img, verbose=0)
            disease_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][disease_idx]) * 100
            disease_name = self.disease_classes[disease_idx]
        else:
            # Fallback to mock
            disease_idx = 1
            confidence = 87.5
            disease_name = 'Brown Spot'
        
        # Rest of the code remains same...
```

### Step 5: Quick Training Script (Simplified)

For hackathon demo, use this minimal training:

```python
# ai-server/quick_train.py
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Use ImageDataGenerator for easy loading
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_gen = datagen.flow_from_directory(
    'path/to/dataset',
    target_size=(224, 224),
    batch_size=32,
    subset='training'
)

val_gen = datagen.flow_from_directory(
    'path/to/dataset',
    target_size=(224, 224),
    batch_size=32,
    subset='validation'
)

# Simple model
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, 3, activation='relu', input_shape=(224, 224, 3)),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(64, 3, activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(train_gen.num_classes, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

model.fit(train_gen, validation_data=val_gen, epochs=10)

model.save('model/disease_detector.h5')
```

---

## 🎯 For Hackathon Demo

**Option 1: Use Pre-trained ONNX Model (Recommended)**
- Download the `asankisan/plant-disease-model` from Hugging Face
- Supports 7 crops: apple, corn, grape, peach, potato, strawberry, tomato
- Uses ONNX Runtime Web for browser inference
- No server required, runs entirely in the browser
- Accuracy: ~90-95% on PlantVillage dataset

**Option 2: Use Pre-trained TensorFlow.js Model**
- Download a pre-trained plant disease model from TensorFlow Hub
- Faster setup, good for demo

**Option 3: Quick Training**
- Use smaller dataset (Rice Leaf Disease - 500MB)
- Train for 5-10 epochs (30-60 minutes)
- Good enough accuracy for demo

**Option 4: Mock with Realistic Data**
- Keep mock but make it more realistic
- Add more disease types
- Use actual disease names from datasets

---

## 📝 Integration Checklist

- [ ] Download dataset
- [ ] Run training script
- [ ] Save model to `ai-server/model/disease_detector.h5`
- [ ] Save class names to `ai-server/model/class_names.json`
- [ ] Update `DiseaseDetector` class in `main.py`
- [ ] Test with sample images
- [ ] Update solutions dictionary with real treatments

---

## 🚀 ONNX Model Integration (Current Implementation)

**Model Used:** `asankisan/plant-disease-model`
- **Format:** ONNX (Open Neural Network Exchange)
- **Runtime:** ONNX Runtime Web
- **Crops Supported:** Apple, Corn, Grape, Peach, Potato, Strawberry, Tomato
- **Architecture:** Two-stage classification (plant type → disease detection)

### How It Works:
1. **Plant Classification:** First identifies the crop type (7 classes)
2. **Disease Detection:** Uses crop-specific model for disease classification
3. **Browser-Based:** Runs entirely in the browser, no server required

### Installation:
```bash
npm install onnxruntime-web
```

### Usage in Code:
```javascript
import * as ort from 'onnxruntime-web';

// Load models
const classifier = await ort.InferenceSession.create('plant_classifier.onnx');
const diseaseModels = {
  tomato: await ort.InferenceSession.create('tomato_disease.onnx'),
  // ... other crops
};

// Preprocess image (224x224, ImageNet normalization)
const tensor = preprocessImage(image);

// Classify plant type first
const plantResult = await classifier.run({ input: tensor });
const plantType = plantClasses[plantResult.output.data.indexOf(Math.max(...plantResult.output.data))];

// Then classify disease
const diseaseModel = diseaseModels[plantType];
const diseaseResult = await diseaseModel.run({ input: tensor });
const disease = diseaseClasses[diseaseResult.output.data.indexOf(Math.max(...diseaseResult.output.data))];
```

### Troubleshooting

**ONNX Runtime CPU Vendor Warning:**
```
[W:onnxruntime:Default, cpuid_info.cc:91 LogEarlyWarning] Unknown CPU vendor. cpuinfo_vendor value: 0
```

This warning has been suppressed in the application code. It was a harmless warning from ONNX Runtime trying to detect CPU features for optimization. The warning does not affect model performance or functionality and is now filtered out of the console.

**Model Loading Issues:**
- If models fail to load, the app automatically falls back to mock results
- Check browser console for detailed error messages
- Ensure stable internet connection for model downloads


