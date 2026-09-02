from typing import List, Dict, Any
from neo4j import GraphDatabase, Driver
from backend.config.settings import settings

class Neo4jClient:
    """
    Neo4j Graph Database Driver client for managing connections, sessions,
    and executing Cypher queries for supply chain topologies.
    """
    def __init__(self, uri: str = None, user: str = None, password: str = None):
        self.uri = uri or settings.NEO4J_URI
        self.user = user or settings.NEO4J_USER
        self.password = password or settings.NEO4J_PASSWORD
        self._driver: Driver = None

    def connect(self):
        try:
            self._driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            print(f"Connected to Neo4j instance at {self.uri}")
        except Exception as e:
            print(f"Neo4j connection warning (using mock graph storage): {e}")

    def close(self):
        if self._driver:
            self._driver.close()

    def run_query(self, query: str, parameters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if not self._driver:
            return []
        with self._driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]
