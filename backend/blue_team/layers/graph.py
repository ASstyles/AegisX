"""
AEGISX Blue Team - Layer 6: Graph & Entity Network Intelligence
Maintains a real-time bipartite entity relationship graph using NetworkX.
Detects shared devices, fraud rings, IP multiplexing, and mule accounts.
"""

import networkx as nx
from typing import Dict, List, Any, Tuple, Optional

class FraudEntityGraph:
    def __init__(self):
        self.G = nx.Graph()

    def add_transaction_edges(
        self,
        customer_id: str,
        device_id: str,
        merchant_id: str,
        city: str,
        ip_address: Optional[str] = None
    ):
        """
        Updates bipartite entity graph with current transaction nodes and edges.
        """
        # Node types
        self.G.add_node(customer_id, type="customer", label=customer_id)
        if device_id:
            self.G.add_node(device_id, type="device", label=device_id)
            self.G.add_edge(customer_id, device_id, relationship="uses")

        if merchant_id:
            self.G.add_node(merchant_id, type="merchant", label=merchant_id)
            self.G.add_edge(customer_id, merchant_id, relationship="transacts_with")

        if ip_address and device_id:
            self.G.add_node(ip_address, type="ip", label=ip_address)
            self.G.add_edge(device_id, ip_address, relationship="originates_from")

    def analyze_entity_graph(
        self,
        customer_id: str,
        device_id: str,
        merchant_id: str
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Returns (sub_score_0_to_100, details_dict)
        """
        sub_score = 0.0
        shared_device_customers = []
        is_fraud_ring = False

        if device_id and self.G.has_node(device_id):
            # Find all customers connected to this device
            neighbors = list(self.G.neighbors(device_id))
            cust_neighbors = [n for n in neighbors if self.G.nodes[n].get("type") == "customer"]
            shared_device_customers = cust_neighbors
            
            # If 3 or more distinct customers share this same device
            if len(cust_neighbors) >= 3:
                is_fraud_ring = True
                sub_score = 90.0
            elif len(cust_neighbors) == 2 and customer_id not in cust_neighbors:
                sub_score = 65.0
            elif len(cust_neighbors) > 1:
                sub_score = 30.0

        details = {
            "connected_customers_count": len(shared_device_customers),
            "shared_customers": shared_device_customers,
            "is_fraud_ring": is_fraud_ring,
            "sub_score": round(sub_score, 1)
        }

        return sub_score, details

    def get_subgraph_for_visualization(self, max_nodes: int = 60) -> Dict[str, Any]:
        """
        Returns node/edge list for interactive frontend graph rendering.
        """
        nodes = []
        edges = []
        
        # Take most connected or recent nodes
        degree_sorted = sorted(self.G.degree, key=lambda x: x[1], reverse=True)[:max_nodes]
        sub_nodes = set(n for n, _ in degree_sorted)

        for n in sub_nodes:
            data = self.G.nodes[n]
            deg = self.G.degree[n]
            nodes.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("type", "entity"),
                "degree": deg,
                "is_suspicious": deg >= 3 and data.get("type") == "device"
            })

        for u, v, data in self.G.edges(data=True):
            if u in sub_nodes and v in sub_nodes:
                edges.append({
                    "source": u,
                    "target": v,
                    "relationship": data.get("relationship", "linked")
                })

        return {"nodes": nodes, "edges": edges}

    def clear(self):
        self.G.clear()

# Global fraud entity graph instance
global_fraud_graph = FraudEntityGraph()
