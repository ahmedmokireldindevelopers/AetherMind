# Ollama Setup Guide

## ⚡️ Pro Tips
1. Reduce Reloads:  
  
   ```bash
   export OLLAMA_KEEP_ALIVE=30m  # Linux/Mac
   set OLLAMA_KEEP_ALIVE=30m     # Windows
   ```
   
2. Auto-Clean Cache:  
  
   ```bash
   ollama prune  # Weekly
   ```
   
3. Dockerize: Isolate environments for multi-project work.

---

## 🔧 One-Click Install Script
```bash
# Core Models
ollama pull phi3:3.8b-instruct-q4
ollama pull sqlcoder:7b-q4_k_m
ollama pull dolphin-db:mini

# Tools
pip install browser-use suna playwright geoip2 kortix
playwright install chromium

# Optional (GPU)
ollama pull deepseek-coder:33b
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

---

## 📌 Key Notes
- Prioritize SSD for frequently used models.
- Use browser-use + playwright for user behavior analysis.
- Monitor RAM/GPU usage with nvidia-smi (Linux) or Task Manager (Windows).

This table provides a complete roadmap for deploying a high-efficiency AI system. Let me know if you need customization! 🎯
