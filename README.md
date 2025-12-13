# Proyecto: Onboard AI - Asistente Inteligente para Onboarding

![alt text](image.png)
## Descripción General

**Onboard AI** es un Asistente Inteligente conversacional que utiliza Inteligencia Artificial Generativa (GenAI) y la arquitectura RAG (Retrieval-Augmented Generation) para **facilitar y acelerar la curva de aprendizaje de nuevos integrantes** a una empresa.

Su propósito es apoyar al talento que ingresa y aligerar la carga del equipo mentor, centralizando la documentación corporativa y respondiendo dudas específicas e instantáneas de manera precisa.

El sistema permite a los nuevos empleados realizar consultas sobre procedimientos, manuales y políticas de la empresa, actuando como un coach 24/7 y logrando una compresión significativa del tiempo necesario para alcanzar la plena productividad.

![alt text](image-1.png)

---

## Objetivo

Acortar la curva de aprendizaje del nuevo talento, transformando un proceso tradicionalmente lento (hasta 28-32 semanas en roles especializados) a uno acelerado, permitiendo alcanzar la plena productividad en tan solo 2 meses. Esto se logra mediante la centralización de conocimiento y el soporte inteligente continuo.

---

## Funcionalidades Clave

- **Curva de Aprendizaje Acelerada:** Reducción del tiempo para alcanzar la plena productividad, respaldada por evidencia como el [NBER Working Paper 31161](https://www.nber.org/papers/w31161).
- **Soporte 24/7:** Actúa como un *coach* inteligente que responde dudas específicas al instante.
- **Centralización de Conocimiento:** Procesa y gestiona toda la documentación pertinente de la empresa (PDFs, documentos, manuales, etc.).
- **Arquitectura RAG:** Utiliza la arquitectura Retrieval-Augmented Generation para asegurar la relevancia y exactitud de las respuestas.
- **Trazabilidad de Interacciones:** Monitoreo del historial y flujo de conversaciones mediante **LangSmith**.
- Interfaz de chat responsiva construida con Next.js.
- Autenticación segura (Login Mediante Google).

---

## Arquitectura del Proyecto

El proyecto se divide en tres componentes principales que implementan el flujo RAG:

### 1. Frontend
- Framework: Next.js (React).
- Estilos: (Se mantiene la asunción de TailwindCSS o similar para interfaz responsiva).
- Autenticación: **NextAuth** (asunción, basado en login mediante Google).
- Despliegue: **Vercel**.
- Características principales:
  - Interfaz conversacional moderna.
  - Interacción con el Asistente GenAI.
  - Control de sesión seguro.

### 2. Backend (Agente GenAI)
- IA: **LangChain** (orquestación del agente AI).
- Modelo: (asunción: OpenAI GPT/Gemini u otro LLM de elección).
- **Base Datos Conversacional:** Se utiliza una base de datos PostgreSQL para las conversaciones.
- **Trazabilidad:** **LangSmith** (para monitoreo y depuración).
- Despliegue: **Cloud Run** (para la ejecución del agente AI).

### 3. ETL para la Base de Datos Vectorial
- **Ingesta:** Documentos estructurados y no estructurados (PDFs, Excel).
- **Vectorización:** **LlamaIndex** (para transformar documentos en *embeddings*).
- **Base de Datos Vectorial:** **Elasticsearch** (para almacenamiento y búsqueda eficiente de los *embeddings*).

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
Next.js, React, TailwindCSS (asunción), NextAuth (OAuth2), Vercel.

**Backend & RAG:**  
Flask, LangChain, LangSmith, LlamaIndex, OpenAI GPT/otro LLM, Elasticsearch, base de datos conversacional (PostgreSQL/u otro).

**Infraestructura:**  
Docker, Google Cloud Run.

---

## Autor

Jesús Zelaya

LinkedIn: https://www.linkedin.com/in/jesuszelayac/

---

## Licencia

Este proyecto se distribuye bajo la licencia MIT.  
Su uso, modificación y redistribución están permitidos bajo los términos de dicha licencia.