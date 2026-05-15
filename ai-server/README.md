# Agro Vision AI Server

FastAPI server for crop disease detection and AI chatbot.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /` - Health check
- `POST /predict` - Predict crop disease from image
  - Body: Form data with `file` (image) and optional `language` (en/bn)
- `POST /chat` - AI chatbot
  - Body: JSON with `message`, `language`, and optional `context`

## Model Training

To use a real trained model:

1. Train your CNN model using TensorFlow/PyTorch
2. Save the model (e.g., `model.h5` or `model.pth`)
3. Update `DiseaseDetector` class in `main.py` to load your model
4. Adjust preprocessing and prediction logic as needed

## Deployment

Deploy to Render, Railway, or any Python hosting service.


