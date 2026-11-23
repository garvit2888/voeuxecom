"""
app.py
Entry point for Hugging Face Spaces (Free Gradio SDK — 16 GB RAM, 2 vCPU).
Mounts a lightweight status page at "/" while serving all VOEUX Virtual Fit
FastAPI endpoints (/api/virtual-fit/health, /detect-corners, /detect-and-fit, /refit).
"""

import gradio as gr
import uvicorn
from main import app as fastapi_app

with gr.Blocks(title="VOEUX® Virtual Fit API") as demo:
    gr.Markdown(
        "# VOEUX® Virtual Fit — ML Vision Engine\n"
        "Status: **Live** · Serving `voeuxtechnologies.in`\n\n"
        "Health Check: [`/api/virtual-fit/health`](/api/virtual-fit/health)"
    )

app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
