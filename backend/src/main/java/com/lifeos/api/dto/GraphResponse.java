package com.lifeos.api.dto;

import java.util.List;

public class GraphResponse {
    private List<Node> nodes;
    private List<Link> links;

    public GraphResponse(List<Node> nodes, List<Link> links) {
        this.nodes = nodes;
        this.links = links;
    }

    public List<Node> getNodes() { return nodes; }
    public void setNodes(List<Node> nodes) { this.nodes = nodes; }

    public List<Link> getLinks() { return links; }
    public void setLinks(List<Link> links) { this.links = links; }

    public static class Node {
        private String id;
        private String label;
        private String type;
        private String category;

        public Node(String id, String label, String type, String category) {
            this.id = id;
            this.label = label;
            this.type = type;
            this.category = category;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public static class Link {
        private String source;
        private String target;
        private String type;

        public Link(String source, String target, String type) {
            this.source = source;
            this.target = target;
            this.type = type;
        }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
