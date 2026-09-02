# Neo4j Graph Database Deployment

## Quickstart with Docker
```bash
docker run \
    --name atmograph-neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -v $HOME/neo4j/data:/data \
    -e NEO4J_AUTH=neo4j/atmograph_password \
    neo4j:5.18.0
```

## Schema & Seed Ingestion
Execute in Neo4j Browser (`http://localhost:7474`):
1. Copy contents of `schema.cypher` and run.
2. Copy contents of `seed.cypher` and run.
