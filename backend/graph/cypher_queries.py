class CypherQueries:
    """
    Optimized Cypher query catalog for graph algorithms, shortest paths,
    chokepoint detection, and blast radius calculation.
    """
    
    GET_FULL_TOPOLOGY = """
    MATCH (n:SupplyNode)
    OPTIONAL MATCH (n)-[r:FLOWS_TO]->(m:SupplyNode)
    RETURN n, r, m
    """
    
    FIND_CHOKEPOINTS = """
    MATCH (c:SupplyNode)
    WHERE c.isChokepoint = true OR c.financialExposureUsd > 100.0
    RETURN c.id AS id, c.name AS name, c.currentRisk AS risk, c.financialExposureUsd AS exposure
    ORDER BY c.currentRisk DESC
    """
    
    FIND_BLAST_RADIUS = """
    MATCH path = (source:SupplyNode {id: $source_id})-[r:FLOWS_TO*1..3]->(target:SupplyNode)
    RETURN target.id AS impacted_id, target.name AS impacted_name, length(path) AS hop_distance
    """
    
    SHORTEST_RESILIENT_PATH = """
    MATCH (start:SupplyNode {id: $origin_id}), (end:SupplyNode {id: $dest_id})
    MATCH p = shortestPath((start)-[:FLOWS_TO*..6]->(end))
    RETURN p
    """
