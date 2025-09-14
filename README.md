# Guibbo – Plataforma clínica (FrontEnd + BackEnd)

Monorepo con **FrontEnd (Vite + React)** y **BackEnd (Node + Express)**.  
Base de datos: (p. ej. MongoDB/PostgreSQL) – ya operativa según tu entorno.

---

## 🧭 Estructura

/
├── FrontEnd/                # Vite + React
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   └── package.json
├── BackEnd/                 # Node + Express (+ Socket.IO)
│   ├── src/
│   ├── .gitignore
│   └── package.json
├── README.md
└── LICENSE (opcional)

---

## 🔧 Requisitos

- Node.js LTS (18.x o 20.x)
- npm o pnpm
- Cuenta en GitHub
- Cuenta en Vercel (FrontEnd)
- Cuenta en Fly.io (BackEnd) y CLI instalada

---

## ⚙️ Variables de entorno

### FrontEnd (`FrontEnd/.env`)
> **Nunca** subas credenciales reales. Versiona solo `FrontEnd/.env.example`.

```env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050