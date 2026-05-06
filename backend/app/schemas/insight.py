from pydantic import BaseModel, Field
from typing import List

class InsightItem(BaseModel):
    insight_title: str = Field(..., description="Judul ringkas dari temuan AI")
    recommendation: str = Field(..., description="Tindakan yang direkomendasikan (Actionable)")
    explanation: str = Field(..., description="Penjelasan logis berbasis data mengapa tindakan ini direkomendasikan (Explainable AI)")

class InsightResponse(BaseModel):
    insights: List[InsightItem] = Field(default_factory=list, description="Daftar insight dan rekomendasi dari AI")
