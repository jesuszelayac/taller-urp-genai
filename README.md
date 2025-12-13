# Proyecto: Onboard AI - Asistente Inteligente para Onboarding
![alt text](image.png)
## Descripción General

[cite_start]**Onboard AI** es un Asistente Inteligente conversacional que utiliza Inteligencia Artificial Generativa (GenAI) y la arquitectura RAG (Retrieval-Augmented Generation) para **facilitar y acelerar la curva de aprendizaje de nuevos integrantes** a una empresa[cite: 6, 22].

[cite_start]Su propósito es apoyar al talento que ingresa y aligerar la carga del equipo mentor, centralizando la documentación corporativa y respondiendo dudas específicas e instantáneas de manera precisa[cite: 25, 24].

[cite_start]El sistema permite a los nuevos empleados realizar consultas sobre procedimientos, manuales y políticas de la empresa, actuando como un coach 24/7 y logrando una compresión significativa del tiempo necesario para alcanzar la plena productividad[cite: 25, 27].
![alt text](image-1.png)
---

## Objetivo

[cite_start]Acortar la curva de aprendizaje del nuevo talento, transformando un proceso tradicionalmente lento (hasta 28-32 semanas en roles especializados [cite: 16][cite_start]) a uno acelerado, permitiendo alcanzar la plena productividad en tan solo 2 meses[cite: 34]. [cite_start]Esto se logra mediante la centralización de conocimiento y el soporte inteligente continuo[cite: 24, 25].

---

## Funcionalidades Clave

- [cite_start]**Curva de Aprendizaje Acelerada:** Reducción del tiempo para alcanzar la plena productividad, respaldada por evidencia como el NBER Working Paper 31161[cite: 39, 27].
- [cite_start]**Soporte 24/7:** Actúa como un *coach* inteligente que responde dudas específicas al instante[cite: 25].
- [cite_start]**Centralización de Conocimiento:** Procesa y gestiona toda la documentación pertinente de la empresa (PDFs, documentos, manuales, etc.)[cite: 24].
- [cite_start]**Arquitectura RAG:** Utiliza la arquitectura Retrieval-Augmented Generation para asegurar la relevancia y exactitud de las respuestas[cite: 22, 26].
- [cite_start]**Trazabilidad de Interacciones:** Monitoreo del historial y flujo de conversaciones mediante **LangSmith**[cite: 60].
- [cite_start]Interfaz de chat responsiva construida con Next.js[cite: 48].
- [cite_start]Autenticación segura (Login Mediante Google)[cite: 52].

---

## Arquitectura del Proyecto

El proyecto se divide en tres componentes principales que implementan el flujo RAG:

### 1. Frontend
- [cite_start]Framework: Next.js (React) [cite: 48]
- Estilos: (Se mantiene la asunción de TailwindCSS o similar para interfaz responsiva)
- [cite_start]Autenticación: **NextAuth** (Asunción, basado en Login Mediante Google [cite: 52])
- [cite_start]Despliegue: **Vercel** [cite: 45]
- Características principales:
  - Interfaz conversacional moderna.
  - Interacción con el Asistente GenAI.
  - Control de sesión seguro.

### 2. Backend (Agente GenAI)
- [cite_start]IA: **LangChain** (Orquestación del Agente AI) [cite: 57]
- Modelo: (Asunción: OpenAI GPT/Gemini u otro LLM de elección)
- [cite_start]**Base Datos Conversacional:** Se utiliza una base de datos PostgreSQL para las conversaciones[cite: 62].
- [cite_start]**Trazabilidad:** **LangSmith** (para monitoreo y depuración) [cite: 60]
- [cite_start]Despliegue: **Cloud Run** (para la ejecución del Agente AI) [cite: 55]

### 3. ETL para la Base de Datos Vectorial
- [cite_start]**Ingesta:** Documentos estructurados y no estructurados (PDFs, Excel)[cite: 66, 65].
- [cite_start]**Vectorización:** **LlamaIndex** (para transformar documentos en *embeddings*)[cite: 67].
- [cite_start]**Base de Datos Vectorial:** **Elasticsearch** (para almacenamiento y búsqueda eficiente de los *embeddings*)[cite: 64, 68].

---

## Instalación y Configuración

### Requisitos Previos
- Python 3.10+
- Node.js 18+
- Docker y gcloud CLI (para despliegue en Cloud Run)
- Cuenta en OpenAI/Proveedor de LLM, Google Cloud y Elasticsearch.

---

### Clonación del Repositorio

git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>

---

### 1. Backend – Flask (Agente IA)

#### Dependencias

cd backend
pip install -r requirements.txt

#### Variables de Entorno

Crea un archivo .env en la carpeta backend:

OPENAI_API_KEY=tu_api_key
LANGCHAIN_API_KEY=tu_api_langchain
LANGCHAIN_PROJECT=onboard-ai-project
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
# **Actualizar según las BDs usadas en tu arquitectura (conversaciones y vectorización)**
DB_URI_CONVERSATIONS=postgresql://user:password@host:port/dbname
ES_URL=https://tu-servidor-elastic:9200
ES_USER=elastic
ES_PASSWORD=tu_password

#### Ejecución Local

python app.py

El servicio estará disponible en:
http://localhost:8080

#### Prueba del Endpoint (ejemplo de consulta de onboarding)

curl "http://localhost:8080/agent?idagente=001&msg=Cuál es el cronograma de pagos?"

---

### 2. Frontend – Next.js

#### Instalación

cd frontend
npm install

#### Variables de Entorno

Crea un archivo .env.local en frontend:

NEXTAUTH_URL=https://tu-frontend.vercel.app/
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
# (Eliminamos OPENAI_API_KEY del frontend por seguridad, el backend lo maneja)
API_BACKEND_URL=https://tu-backend.cloudrun.app

#### Ejecución Local

npm run dev

La aplicación estará disponible en:
http://localhost:3000

---

## Despliegue

### Opción A – Docker (Backend)

Construcción de imagen

docker build -t onboard-ai-backend .

Ejecución

docker run -d -p 8080:8080   -e OPENAI_API_KEY="tu_api_key"   -e LANGCHAIN_API_KEY="tu_api_langchain"   -e DB_URI_CONVERSATIONS="postgresql://user:password@host:port/dbname"   onboard-ai-backend

Prueba

curl "http://localhost:8080/agent?idagente=123&msg=Dónde encuentro el plan de salud?"

---

### Opción B – Google Cloud Run (Backend)

Despliegue

gcloud run deploy onboard-ai-backend   --image gcr.io/<tu-proyecto>/onboard-ai-backend:latest   --platform managed   --region us-east1   --allow-unauthenticated

Asegúrate de configurar las variables de entorno (incluyendo las de BD y APIs) directamente en el panel de Cloud Run.

---

### Opción C – Vercel (Frontend)

Despliegue del Frontend
1. Accede a https://vercel.com.
2. Importa el repositorio desde GitHub.
3. Configura las variables de entorno (.env.local, especialmente `NEXTAUTH_URL` y `API_BACKEND_URL`).
4. Ejecuta el despliegue.

---

## Stack Tecnológico

**Frontend:**  
[cite_start]Next.js, React, TailwindCSS (Asunción), NextAuth (OAuth2), Vercel [cite: 48, 45, 52]  

**Backend & RAG:**  
[cite_start]Flask, LangChain, LangSmith, LlamaIndex, OpenAI GPT/Otro LLM, Elasticsearch, Base de Datos Conversacional (PostgreSQL/Otro) [cite: 57, 60, 67, 64, 62]  

**Infraestructura:**  
[cite_start]Docker, Google Cloud Run [cite: 55]  

---

## Autor

**Jesús Zelaya**  
LinkedIn: https://www.linkedin.com/in/jesuszelayac/

---

## Licencia

Este proyecto se distribuye bajo la licencia MIT.  
Su uso, modificación y redistribución están permitidos bajo los términos de dicha licencia.