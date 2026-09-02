import pytest
from backend.graph.cypher_queries import CypherQueries

def test_cypher_query_catalog():
    assert "MATCH (n:SupplyNode)" in CypherQueries.GET_FULL_TOPOLOGY
    assert "isChokepoint" in CypherQueries.FIND_CHOKEPOINTS
    assert "shortestPath" in CypherQueries.SHORTEST_RESILIENT_PATH
