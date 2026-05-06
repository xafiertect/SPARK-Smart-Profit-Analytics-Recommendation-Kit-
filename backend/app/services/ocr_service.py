import numpy as np
import cv2
import logging

logger = logging.getLogger(__name__)

# PaddleOCR is a heavy dependency. We load it lazily or globally.
# For this example, we initialize it globally so it's loaded once.
try:
    from paddleocr import PaddleOCR
    # use_angle_cls=True helps with rotated text
    ocr = PaddleOCR(use_angle_cls=True, lang='id')
except ImportError:
    logger.warning("PaddleOCR not installed or failed to import. OCR will not work.")
    ocr = None

async def extract_text_from_image(image_bytes: bytes) -> str:
    if ocr is None:
        raise RuntimeError("PaddleOCR is not initialized.")
        
    # Decode bytes into OpenCV format
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image format or corrupted image.")

    # Perform OCR
    result = ocr.ocr(img, cls=True)
    
    extracted_text = []
    # Result is a list of results for each detected block
    if result:
        for idx in range(len(result)):
            res = result[idx]
            if res:
                for line in res:
                    # line format: [[box], [text, confidence]]
                    text = line[1][0]
                    extracted_text.append(text)
                    
    raw_text = "\n".join(extracted_text)
    logger.info(f"Extracted {len(extracted_text)} lines of text from image.")
    return raw_text
