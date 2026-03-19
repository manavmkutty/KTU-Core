import os
import shutil
import uuid
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────
DATA_DIR      = "./data"
CHROMA_PATH   = "./data/chromadb_data"
REBUILD_INDEX = True                  # Set False after first run to skip re-indexing

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE    = 800
CHUNK_OVERLAP = 150

# ──────────────────────────────────────────────────────────────────────────────
# Shared objects (imported by chat.py)
# ──────────────────────────────────────────────────────────────────────────────
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

if REBUILD_INDEX and os.path.exists(CHROMA_PATH):
    shutil.rmtree(CHROMA_PATH)

_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = _client.get_or_create_collection(
    name="documents_collection",
    metadata={"hnsw:space": "cosine"}
)


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────
def load_data_to_chromadb():
    """Load PDFs, chunk them, embed and store in ChromaDB."""
    if not REBUILD_INDEX:
        print("Index already exists. Skipping data loading.")
        return

    documents = _load_documents()
    chunks    = _chunk_documents(documents)

    print("Generating embeddings and storing in ChromaDB …")
    for chunk in chunks:
        emb = embedding_function(chunk.page_content, embedding_model)
        _store_in_chromadb(chunk, emb)

    print(f"Stored {collection.count()} chunks in ChromaDB.\n")


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
def embedding_function(text: str, model: SentenceTransformer):
    """Embed a single text string using the shared SentenceTransformer model."""
    return model.encode(text)


def _load_documents():
    loader = DirectoryLoader(path=DATA_DIR, glob="*.pdf", loader_cls=PyPDFLoader)
    docs = loader.load()
    print(f"Loaded {len(docs)} page(s) from '{DATA_DIR}'")
    return docs


def _chunk_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
    )
    chunks = splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
    return chunks


def _store_in_chromadb(chunk, embeddings):
    collection.add(
        ids=[str(uuid.uuid4())],
        documents=[chunk.page_content],
        embeddings=[embeddings.tolist()],
        metadatas=[chunk.metadata],
    )