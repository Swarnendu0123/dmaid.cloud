# Dmaid.cloud
Dmaid.cloud is a Mermaid based diagram editor that allows you to create and edit diagrams in real-time. It is a web-based application that can be accessed from any device with a web browser. Dmaid.cloud is designed to be easy to use and intuitive, so you can create professional-looking diagrams quickly and easily.


# Architecture

```mermaid 
graph TD;
    subgraph User Interface
        User[User] -->|Edits Mermaid Code| WebEditor[Web Editor]
        WebEditor -->|Sends Request| Backend[Backend Server]
        WebEditor -->|Displays Diagram| Diagram[Diagram Output]
    end

    subgraph Backend Logic
        Backend -->|Communicates with| API[Gemini API]
        API -->|Generates Mermaid| MermaidCode[Mermaid Code]
        Backend -->|Stores/Retrieves| Database[Database]
    end

    subgraph Database Layer
        Database -->|Stores| CodeData[(Mermaid Code)]
        Database -->|Stores| DiagramData[(Diagram Configurations)]
    end

    WebEditor -->|Requests Diagram Generation| Backend
    Backend -->|Sends Mermaid Code| API
    API -->|Returns Generated Diagram| Backend
    Backend -->|Sends Diagram Data| WebEditor
```


# Project Details 
https://www.tldraw.com/f/4CtJWrRjnFN-ORD68BzyE


# Technologies
- React
- Express
- MongoDB
- TypeScript
- Google Gemini APIs


# Deployments and URLS
- Client URL: [https://dmaid.cloud](https://dmaid.cloud)
- Server URL: [https://api.dmaid.cloud](https://api.dmaid.cloud)