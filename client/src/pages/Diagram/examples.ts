export const examples = [
  {
    id: "1",
    name: "Flowchart",
    code: "flowchart TD\n  Start([Start Process]) --> Validate{Input Valid?}\n  Validate -- Yes --> Process[Execute Logic]\n  Validate -- No --> Error[Show Error Message]\n  Process --> Decision{Result OK?}\n  Decision -- Yes --> End([Success])\n  Decision -- No --> Retry[Re-run Process]\n  Retry --> Process",
    description:
      "A detailed flow showing input validation, branching logic, retry mechanisms, and termination.",
  },
  {
    id: "2",
    name: "Sequence Diagram",
    code: "sequenceDiagram\n  participant User\n  participant Frontend\n  participant Backend\n  participant DB\n  User->>Frontend: Click 'Submit'\n  Frontend->>Backend: POST /data\n  Backend->>DB: INSERT INTO table\n  DB-->>Backend: Insert Success\n  Backend-->>Frontend: 200 OK\n  Frontend-->>User: Show Success Toast",
    description:
      "Models a full-stack request-response cycle between user, frontend, backend, and database.",
  },
  {
    id: "3",
    name: "Class Diagram",
    code: "classDiagram\n  class AuthService {\n    +login(username, password)\n    +logout()\n    +refreshToken()\n  }\n  class User {\n    -id: int\n    -email: string\n    +getProfile()\n  }\n  class SessionManager {\n    +createSession()\n    +destroySession()\n  }\n  AuthService --> User\n  AuthService --> SessionManager",
    description:
      "OOP-style representation of classes and relationships in an authentication system.",
  },
  {
    id: "4",
    name: "State Diagram",
    code: "stateDiagram-v2\n  [*] --> LoggedOut\n  LoggedOut --> LoggingIn: Submit Credentials\n  LoggingIn --> LoggedIn: Success\n  LoggingIn --> LoggedOut: Failure\n  LoggedIn --> Expired: Token Timeout\n  Expired --> LoggedOut\n  LoggedIn --> LoggedOut: Logout Click",
    description:
      "Describes the lifecycle of a user session with transitions based on events.",
  },
  {
    id: "5",
    name: "Entity Relationship Diagram",
    code: "erDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ ORDER_ITEM : contains\n  PRODUCT ||--|{ ORDER_ITEM : ordered\n  USER }|..|{ ADDRESS : has",
    description:
      "Complex ERD showing user-to-order relationships, many-to-many product ordering, and address linkage.",
  },
  {
    id: "6",
    name: "Gantt Chart",
    code: "gantt\n  title Project Timeline\n  dateFormat  YYYY-MM-DD\n  section Planning\n  Requirements Gathering :done, a1, 2025-05-01, 7d\n  Design :a2, after a1, 5d\n  section Development\n  Frontend :active, a3, after a2, 10d\n  Backend :a4, after a2, 10d\n  section Testing\n  Unit Tests :a5, after a4, 5d\n  Integration Tests :a6, after a5, 5d\n  section Deployment\n  Deploy to Staging :a7, after a6, 2d\n  Deploy to Production :a8, after a7, 1d",
    description:
      "Multi-phase Gantt chart showing dependencies and parallel execution across different project stages.",
  },
  {
    id: "7",
    name: "Pie Chart",
    code: 'pie\n  title Resource Allocation\n  "Engineering" : 40\n  "Marketing" : 25\n  "Design" : 15\n  "QA" : 10\n  "Operations" : 10',
    description: "Breakdown of team resource allocation in percentages.",
  },
  {
    id: "8",
    name: "Requirement Diagram (Simulated)",
    code: 'graph TD\n  loginReq["R1: Login with email/password"]\n  twoFAReq["R2: 2FA using TOTP"]\n  secureStorage["R3: Store passwords using bcrypt"]\n  loginReq --> secureStorage\n  loginReq --> twoFAReq',
    description:
      "Simulates a requirement diagram using flowchart syntax in Mermaid for compatibility.",
  },
  {
    id: "9",
    name: "User Journey Diagram",
    code: "journey\n  title User Onboarding Journey\n  section Signup\n    Visit Page: 3: User\n    Fill Form: 4: User\n    Submit Form: 5: User\n  section Post Signup\n    Email Verification: 4: User\n    First Login: 3: User\n    Explore Dashboard: 5: User",
    description:
      "Tracks a new user’s path from signup to engagement within the app.",
  },
  {
    id: "10",
    name: "Git Graph",
    code: 'gitGraph\n  commit id: "a1" tag: "v1.0"\n  branch feature/login\n  checkout feature/login\n  commit id: "a2"\n  commit id: "a3" tag: "login-complete"\n  checkout main\n  merge feature/login tag: "v1.1"\n  branch feature/2fa\n  checkout feature/2fa\n  commit\n  checkout main\n  merge feature/2fa tag: "v1.2"',
    description:
      "Visual representation of branching, tagging, and merging in a typical Git workflow.",
  },
  {
    id: "11",
    name: "Mindmap",
    code: "mindmap\n  Root((Tech Stack))\n    Frontend\n      React\n      TailwindCSS\n      Vite\n    Backend\n      Node.js\n      Express\n      Prisma\n    DevOps\n      Docker\n      GitHub Actions\n      AWS",
    description:
      "Tech stack organized into frontend, backend, and DevOps with tools under each category.",
  },
  {
    id: "12",
    name: "Timeline",
    code: "timeline\n  title Startup Growth Timeline\n  2023-01 : Product Ideation\n  2023-04 : MVP Launched\n  2023-07 : Seed Funding Raised\n  2023-12 : 10K Users\n  2024-06 : Series A Round",
    description: "Chronological representation of major startup milestones.",
  },
  {
    id: "13",
    name: "Quadrant Chart",
    code: 'quadrantChart\n  title Features Prioritization\n  x-axis Ease of Implementation --> Hard\n  y-axis Low Value --> High Value\n  quadrant-1 Quick Wins\n  quadrant-2 High Value, Hard\n  quadrant-3 Low Priority\n  quadrant-4 Traps\n  "Login with Google" : [0.2, 0.9]\n  "Offline Mode" : [0.8, 0.8]\n  "Dark Mode" : [0.3, 0.6]',
    description:
      "Decision-making tool for feature prioritization based on value and effort.",
  },
  {
    id: "14",
    name: "C4 Context Diagram",
    code: 'C4Context\n  Person(customer, "Customer", "Uses the banking system to manage accounts and transactions")\n  System(bankingSystem, "Banking System", "Allows customers to view balances, transfer funds, and pay bills")\n  System_Ext(paymentGateway, "Payment Gateway", "Third-party service for processing payments")\n  System_Ext(notificationService, "Notification Service", "Sends SMS and email alerts")\n\n  Rel(customer, bankingSystem, "Uses for account management and transactions")\n  Rel(bankingSystem, paymentGateway, "Integrates with for payment processing")\n  Rel(bankingSystem, notificationService, "Sends transaction alerts via")',
    description:
      "A C4 Context diagram showing the Customer, the core Banking System, and its integrations with a Payment Gateway and a Notification Service.",
  },
  {
    id: "15",
    name: "Multiplayer Game Sequence Diagram",
    code: 'sequenceDiagram\n  participant Client1 as "Game Client 1"\n  participant Client2 as "Game Client 2"\n  participant Server as "Game Server"\n  participant SignalingServer as "Signaling Server for WebRTC"\n\n  Note over Client1,Server: Establish WebSocket Connection\n  Client1->>Server: WebSocket Handshake\n  Server->>Client1: WebSocket Connection Established\n\n  Note over Client2,Server: Establish WebSocket Connection\n  Client2->>Server: WebSocket Handshake\n  Server->>Client2: WebSocket Connection Established\n\n  Note over Client1,SignalingServer: Discover and Connect via WebRTC (Signaling)\n  Client1->>SignalingServer: WebRTC Offer (via Signaling Server)\n  SignalingServer->>Client2: Forward WebRTC Offer\n  Client2->>SignalingServer: WebRTC Answer\n  SignalingServer->>Client1: Forward WebRTC Answer\n  Client1->>SignalingServer: WebRTC Ice Candidates\n  SignalingServer->>Client2: Forward WebRTC Ice Candidates\n  Client2->>SignalingServer: WebRTC Ice Candidates\n  SignalingServer->>Client1: Forward WebRTC Ice Candidates\n\n  Note over Client1,Server: Synchronize Game State via WebSocket\n  Client1->>Server: Game State Update\n  Server->>Client1: Game State Update\n  Server->>Client2: Game State Update (Broadcast)\n\n  Note over Client2,Server: Synchronize Game State via WebSocket\n  Client2->>Server: Game State Update\n  Server->>Client2: Game State Update\n  Server->>Client1: Game State Update (Broadcast)\n\n  Note over Client1,Client2: Exchange Game Data via WebRTC\n  Client1->>Client2: Game Data (Peer-to-Peer)\n  Client2->>Client1: Game Data (Peer-to-Peer)\n\n  Note over Client1,Server: Additional Data Exchange (Optional)\n  Client1->>Server: Additional Data (e.g., chat, score)\n  Server->>Client1: Additional Data (e.g., chat, score)\n  Server->>Client2: Additional Data (Broadcast)',
    description:
      "Shows how two game clients establish WebSocket connections with the game server, set up WebRTC via a signaling server for peer-to-peer game data, and synchronize game state and additional data (e.g., chat, scores).",
  },
  {
    id: "16",
    name: "ERP ER Diagram",
    code: "erDiagram\n    USERS {\n        int user_id PK\n        string username\n        string password\n        string role\n    }\n    CUSTOMERS {\n        int customer_id PK\n        string customer_name\n        string email\n        string phone\n    }\n    PRODUCTS {\n        int product_id PK\n        string product_name\n        decimal price\n        string description\n    }\n    ORDERS {\n        int order_id PK\n        int customer_id FK\n        date order_date\n        decimal total\n    }\n    ORDER_ITEMS {\n        int order_item_id PK\n        int order_id FK\n        int product_id FK\n        int quantity\n    }\n    INVENTORY {\n        int inventory_id PK\n        int product_id FK\n        int quantity\n    }\n    SUPPLIERS {\n        int supplier_id PK\n        string supplier_name\n        string email\n        string phone\n    }\n    PURCHASE_ORDERS {\n        int purchase_order_id PK\n        int supplier_id FK\n        date purchase_order_date\n        decimal total\n    }\n    PURCHASE_ORDER_ITEMS {\n        int purchase_order_item_id PK\n        int purchase_order_id FK\n        int product_id FK\n        int quantity\n    }\n\n    USERS ||--o{ ORDERS : places\n    CUSTOMERS ||--o{ ORDERS : places\n    ORDERS ||--o{ ORDER_ITEMS : contains\n    PRODUCTS ||--o{ ORDER_ITEMS : contains\n    PRODUCTS ||--o{ INVENTORY : has\n    SUPPLIERS ||--o{ PURCHASE_ORDERS : places\n    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : contains\n    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : contains",
    description:
      "ER diagram modeling an e-commerce system with users, customers, products, orders, order items, inventory, suppliers, purchase orders, and purchase order items, showing primary and foreign keys and their relationships.",
  },
  {
    id: "17",
    name: "Packet Diagram",
    code: 'packet-beta\n  0-15: "Source Port"\n  16-31: "Destination Port"\n  32-63: "Sequence Number"\n  64-95: "Acknowledgment Number"\n  96-99: "Data Offset"\n  100-105: "Reserved"\n  106: "URG"\n  107: "ACK"\n  108: "PSH"\n  109: "RST"\n  110: "SYN"\n  111: "FIN"\n  112-127: "Window"\n  128-143: "Checksum"\n  144-159: "Urgent Pointer"\n  160-191: "(Options and Padding)"\n  192-255: "Data (variable length)"',
    description:
      "Detailed breakdown of the TCP packet structure showing bit ranges and field names.",
  },
  {
    id: "19",
    name: "Block Diagram",
    code: 'block-beta\n  columns 3\n  doc>"Document"]:3\n  space down1<[" "]>(down) space\n\n  block:e:3\n          l["left"]\n          m("A wide one in the middle")\n          r["right"]\n  end\n    space down2<[" "]>(down) space\n    db[("DB")]:3\n    space:3\n    D space C\n    db --> D\n    C --> db\n    D --> C\n    style m fill:#d6d,stroke:#333,stroke-width:4px',
    description:
      "A block diagram with 3 columns featuring a document, a middle wide block styled distinctly, and a database block with bidirectional connections.",
  },
  {
    "id": "20",
    "name": "Basic Decision Flowchart",
    "code": "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Process 1]\n  B -->|No| D[Process 2]\n  C --> E[End]\n  D --> E[End]",
    "description": "A simple top-down flowchart showing a decision and two possible outcomes leading to an end."
  },
  {
    "id": "21",
    "name": "Sales Revenue XY Chart",
    "code": "xychart-beta\n  title \"Sales Revenue\"\n  x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]\n  y-axis \"Revenue (in $)\" 4000 --> 11000\n  bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]\n  line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]",
    "description": "A combined bar and line XY chart depicting monthly sales revenue with the y-axis range from 4000 to 11000 dollars."
  }
  
];
