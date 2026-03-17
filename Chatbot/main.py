from datastore import load_data_to_chromadb
from chat import querying

def main():
    load_data_to_chromadb()
    querying()

if __name__ == "__main__":
    main()