from langchain_openai import ChatOpenAI
import os
from flask import Flask, jsonify, request
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage
from langchain_openai import OpenAIEmbeddings
from langchain_elasticsearch import ElasticsearchStore
from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.prebuilt import create_react_agent


## datos de trazabilidad
os.environ["LANGSMITH_ENDPOINT"]="https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = ""
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = ""
os.environ["OPENAI_API_KEY"] =""


app = Flask(__name__)

@app.route('/agent', methods=['GET'])
def main():
    #Capturamos variables enviadas
    id_agente = request.args.get('idagente')
    msg = request.args.get('msg')
    #datos de configuracion
    DB_URI = ""

    connection_kwargs = {
        "autocommit": True,
        "prepare_threshold": 0,
    }

    #Recuperar PDFs
    db_query = ElasticsearchStore(
        es_url="", #IP de tu servidor Elastics
        es_user="elastic",
        es_password="",
        index_name="llamaindex_jz1",
        embedding=OpenAIEmbeddings())

    # Herramienta RAG
    retriever = db_query.as_retriever()
    tool_rag = retriever.as_tool(
        name="busqueda_documentos_internos_metanoia",
        description=(
            "Herramienta especializada para consultar información interna, oficial y detallada de la empresa Metanoia Uniformes. "
            "Úsala para responder preguntas sobre **políticas, procesos de contratación, beneficios, uniformes, documentos requeridos, "
            "guías de bienvenida, permisos de colaboradores, garantía y servicio postventa**. "
            "No uses esta herramienta para preguntas generales o que no estén relacionadas con las políticas internas de Metanoia."
            )
    )

    #Recuperar Excel
    db_query_excel = ElasticsearchStore(
        es_url="", #IP de tu servidor Elastic
        es_user="elastic",
        es_password="",
        index_name="llamaindex_jz2",
        embedding=OpenAIEmbeddings())

    # Herramienta RAG
    retriever_excel = db_query_excel.as_retriever()
    tool_rag_excel = retriever_excel.as_tool(
        name="busqueda_excel_interno_metanoia",
        description=(
            "CONSULTA el índice 'llamaindex_jz2' con datos estructurados de ventas B2B de Metanoia Uniformes a empresas mineras. "
            "CONTENIDO DISPONIBLE: "
            "• Tabla de 4 empresas mineras (Corona, El Brocal, Buenaventura, Antamina) "
            "• Columnas: Empresa, Área/Cargo, Contacto, Status, Descripción, Ranking "
            "• Status posibles: 'Proceso de Compra', 'En Postulación', 'Cierre de Compra', 'Envio de Muestras' "
            "• Rankings: 1-4 (1 = máximo prioridad) "
            "• Descripciones detalladas por cliente con cantidades y especificaciones "
            "USO: Para preguntas específicas sobre estado de ventas, contactos comerciales, detalles de pedidos o ranking de clientes."
        )
    )

    # Inicializamos la memoria
    with ConnectionPool(
            # Example configuration
            conninfo=DB_URI,
            max_size=20,
            kwargs=connection_kwargs,
    ) as pool:
        checkpointer = PostgresSaver(pool)

        # Inicializamos el modelo
        model = ChatOpenAI(model="gpt-4.1-2025-04-14")

        # Agrupamos las herramientas
        tolkit = [tool_rag,tool_rag_excel]

        prompt = ChatPromptTemplate.from_messages([
            ("system", 
            """
            ROL Y PERSONALIDAD:
            Eres Onboard AI, un asistente virtual **experto y proactivo** que facilita la inducción de nuevos colaboradores a Metanoia Uniformes. Tu rol es actuar como un amigo experto que brinda **información esencial de Recursos Humanos y contexto comercial clave**.
            
            Tu objetivo es doble:
            1.  Resolver las dudas iniciales de **RRHH** (políticas, beneficios).
            2.  Brindar **contexto estratégico y comercial** (estado de clientes B2B) para que el nuevo integrante se integre rápidamente.

            INSTRUCCIONES Y FLUJO DE INTERACCIÓN:

            1. Saludo y Exploración (Inicio):
                * Comienza dando un saludo cálido y una bienvenida entusiasta a Metanoia Uniformes.
                * Pregunta abierta: ¿En qué puedo ayudarte hoy para facilitar tu llegada?
                * Sugiere opciones de forma dual: "¿Necesitas información sobre tu uniforme o beneficios, o quizás prefieres conocer el **estatus de nuestros clientes mineros prioritarios**?"

            2. Manejo de Información (Respuesta):
                * **Prioridad 1: Herramientas (Uso Dual).**
                    * **Consulta Comercial (Ventas/Clientes):** Si la pregunta es sobre el estado de un cliente, ranking, contacto o detalle de pedido (empresas mineras como Corona o Antamina), **DEBES usar la herramienta `busqueda_excel_interno_metanoia`**.
                    * **Consulta de RRHH (Políticas/Beneficios):** Si la pregunta es sobre políticas, procesos, beneficios o documentos de Metanoia, **DEBES usar la herramienta `busqueda_documentos_internos_metanoia`**.
                * Prioridad 2: Información Estática (Links): Para cronograma de pagos, plan de salud o ubicación, proporciona el link directamente.
                
                * **Información Ausente (Learning Hour):** Si la respuesta no se encuentra ni en la herramienta ni en tu conocimiento estático (un tema nuevo para aprender):
                    * **A) Ofrece agendar una "Learning Hour"** con el equipo.
                    * **B) Proporciona el siguiente enlace de Google Calendar** (el agente debe insertar el tema que el usuario desea aprender en lugar de `[TEMA_A_APRENDER]`).
                    
                    * **Plantilla de Enlace para Agendar:** ``
                    
                    * Como alternativa, sugiere contactar a su supervisor inmediato. **NUNCA inventes información.**

            3. Estilo y Tono:
                * Mantén un tono siempre positivo, entusiasta, proactivo y natural.
                * **Sé breve y al punto**.
                * El uso de la información de ventas debe ser **contextual y estratégico**, ayudando al ingresante a entender la prioridad y el estado de los negocios.

            4. Cierre y Continuidad (Final de la Respuesta):
                * Después de responder, siempre finaliza preguntando: "¿Tienes alguna otra consulta o duda sobre tu llegada a Metanoia?"

            INFORMACIÓN ESTÁTICA Y LINKS CLAVE:
            Utiliza los siguientes enlaces para responder preguntas específicas. Siempre preséntalos de forma amigable.

            * Cronograma de Pagos 2026: https://metanoia.com/recursos/cronograma-2026
            * Plan de Salud Colaboradores: https://metanoia.com/beneficios/plan-salud-oficial
            * Ubicación Oficina Central: Cal. las Fresas Mza. G1 Lote. 3, Ate Vitarte (usar solo si pregunta por la dirección física).
            """),
            ("human", "{messages}"),
            ]
        )
        # inicializamos el agente
        agent_executor = create_react_agent(model, tolkit, checkpointer=checkpointer, prompt=prompt)
        # ejecutamos el agente
        config = {"configurable": {"thread_id": id_agente}}
        response = agent_executor.invoke({"messages": [HumanMessage(content=msg)]}, config=config)
        return response['messages'][-1].content


if __name__ == '__main__':
    # La aplicación escucha en el puerto 8080, requerido por Cloud Run
    app.run(host='0.0.0.0', port=8080)