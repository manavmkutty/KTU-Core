import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

# Import shared objects from datastore
from datastore import collection, embedding_model

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────
MAX_RECENT_CONVERSATIONS = 5   # last N user+AI pairs kept verbatim
TOP_K_RESULTS            = 5   # top chunks to retrieve from ChromaDB

SYSTEM_PROMPT = """\
You are a helpful academic assistant for KTU (Kerala Technological University) students.
You have been provided three sources of information to answer the student's question:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 RETRIEVED CONTEXT  (top-5 relevant document chunks):
{context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗂️  SUMMARY OF OLDER CONVERSATION (30% weightage):
{older_summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instructions:
- Answer ONLY using the provided context.
- If the answer is not in the context, say:
- "I don't have that information in the provided materials."
- Do NOT make up answers.
- Give 70% weightage to the RETRIEVED CONTEXT and the last 5 messages below.
- Give 30% weightage to the SUMMARY OF OLDER CONVERSATION for continuity.
- If the answer is not found in the provided context, say so clearly.
- Be concise, precise, and academically helpful.
"""

SUMMARIZE_PROMPT = """\
You are a conversation summarizer.
Merge the EXISTING SUMMARY with the NEW CONVERSATION EXCHANGE into one concise updated summary.
Preserve all important facts that were discussed.

EXISTING SUMMARY:
{existing_summary}

NEW CONVERSATION TO MERGE:
User: {user_msg}
Assistant: {ai_msg}

Respond with ONLY the updated summary — no preamble, no labels.
"""


# ──────────────────────────────────────────────────────────────────────────────
# Helper: embed query → ChromaDB retrieval → top-K context string
# ──────────────────────────────────────────────────────────────────────────────
def _retrieve_context(user_query: str) -> str:
    """Embed the user query using the same model used during indexing, then retrieve top-K chunks."""
    query_embedding = embedding_model.encode([user_query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=TOP_K_RESULTS,
    )
    docs = results.get("documents", [[]])[0]
    if not docs:
        return "No relevant documents found in the knowledge base."
    return "\n\n---\n\n".join(docs)


# ──────────────────────────────────────────────────────────────────────────────
# Initialization (Run Once)
# ──────────────────────────────────────────────────────────────────────────────
def initialize_llm():
    load_dotenv("api.env")
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise EnvironmentError("GROQ_API_KEY not found. Add it to api.env.")
    os.environ["GROQ_API_KEY"] = api_key

    main_llm    = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, max_tokens=1024)
    summary_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1, max_tokens=512)

    answer_prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="recent_messages"),
        ("human", "{user_query}"),
    ])
    answer_chain = answer_prompt | main_llm | StrOutputParser()

    summarize_prompt = ChatPromptTemplate.from_messages([
        ("human", SUMMARIZE_PROMPT),
    ])
    summarize_chain = summarize_prompt | summary_llm | StrOutputParser()
    
    return answer_chain, summarize_chain

# Global chains to avoid reloading
answer_chain, summarize_chain = None, None

def get_chains():
    global answer_chain, summarize_chain
    if answer_chain is None or summarize_chain is None:
        answer_chain, summarize_chain = initialize_llm()
    return answer_chain, summarize_chain

# ──────────────────────────────────────────────────────────────────────────────
# Core Logic
# ──────────────────────────────────────────────────────────────────────────────
def generate_response(user_query: str, session_state: dict) -> str:
    """
    Given a user query and a session state dict containing:
      - recent_messages: list
      - older_summary: str
    It returns the AI response and mutates the session_state in place.
    """
    ans_chain, sum_chain = get_chains()
    
    # 1️⃣  Retrieve top-5 relevant chunks from ChromaDB
    context = _retrieve_context(user_query)

    recent_messages = session_state.get("recent_messages", [])
    older_summary = session_state.get("older_summary", "")

    # 2️⃣  Memory management
    max_msg_objects = MAX_RECENT_CONVERSATIONS * 2
    if len(recent_messages) >= max_msg_objects:
        oldest_human: HumanMessage = recent_messages.pop(0)
        oldest_ai:    AIMessage    = recent_messages.pop(0)

        older_summary = sum_chain.invoke({
            "existing_summary": older_summary or "No prior summary.",
            "user_msg":         oldest_human.content,
            "ai_msg":           oldest_ai.content,
        })
        session_state["older_summary"] = older_summary

    # 3️⃣  Build prompt and invoke main answer chain
    response = ans_chain.invoke({
        "context":          context,
        "older_summary":    older_summary if older_summary else "No older conversation history yet.",
        "recent_messages":  recent_messages,
        "user_query":       user_query,
    })

    # 4️⃣  Append current turn to recent history AFTER generating the response
    recent_messages.append(HumanMessage(content=user_query))
    recent_messages.append(AIMessage(content=response))
    session_state["recent_messages"] = recent_messages

    return response