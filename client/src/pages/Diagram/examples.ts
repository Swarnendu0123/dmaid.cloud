export const examples = [
  {
    category: "Flowchart",
    diagrams: [
      {
        id: "1",
        name: "Flowchart",
        code: "flowchart TD\n  Start([Start Process]) --> Validate{Input Valid?}\n  Validate -- Yes --> Process[Execute Logic]\n  Validate -- No --> Error[Show Error Message]\n  Process --> Decision{Result OK?}\n  Decision -- Yes --> End([Success])\n  Decision -- No --> Retry[Re-run Process]\n  Retry --> Process",
        description:
          "A detailed flow showing input validation, branching logic, retry mechanisms, and termination.",
      },
      {
        id: "20",
        name: "Basic Decision Flowchart",
        code: "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Process 1]\n  B -->|No| D[Process 2]\n  C --> E[End]\n  D --> E[End]",
        description:
          "A simple top-down flowchart showing a decision and two possible outcomes leading to an end.",
      },
    ],
  },

  {
    category: "Sequence Diagram",
    diagrams: [
      {
        id: "2",
        name: "Sequence Diagram",
        code: "sequenceDiagram\n  participant User\n  participant Frontend\n  participant Backend\n  participant DB\n  User->>Frontend: Click 'Submit'\n  Frontend->>Backend: POST /data\n  Backend->>DB: INSERT INTO table\n  DB-->>Backend: Insert Success\n  Backend-->>Frontend: 200 OK\n  Frontend-->>User: Show Success Toast",
        description:
          "Models a full-stack request-response cycle between user, frontend, backend, and database.",
      },
      {
        id: "15",
        name: "Multiplayer Game Sequence",
        code: 'sequenceDiagram\n  participant Client1 as "Game Client 1"\n  participant Client2 as "Game Client 2"\n  participant Server as "Game Server"\n  participant SignalingServer as "Signaling Server for WebRTC"\n\n  Note over Client1,Server: Establish WebSocket Connection\n  Client1->>Server: WebSocket Handshake\n  Server->>Client1: WebSocket Connection Established\n\n  Note over Client2,Server: Establish WebSocket Connection\n  Client2->>Server: WebSocket Handshake\n  Server->>Client2: WebSocket Connection Established\n\n  Note over Client1,SignalingServer: Discover and Connect via WebRTC (Signaling)\n  Client1->>SignalingServer: WebRTC Offer (via Signaling Server)\n  SignalingServer->>Client2: Forward WebRTC Offer\n  Client2->>SignalingServer: WebRTC Answer\n  SignalingServer->>Client1: Forward WebRTC Answer\n  Client1->>SignalingServer: WebRTC Ice Candidates\n  SignalingServer->>Client2: Forward WebRTC Ice Candidates\n  Client2->>SignalingServer: WebRTC Ice Candidates\n  SignalingServer->>Client1: Forward WebRTC Ice Candidates\n\n  Note over Client1,Server: Synchronize Game State via WebSocket\n  Client1->>Server: Game State Update\n  Server->>Client1: Game State Update\n  Server->>Client2: Game State Update (Broadcast)\n\n  Note over Client2,Server: Synchronize Game State via WebSocket\n  Client2->>Server: Game State Update\n  Server->>Client2: Game State Update\n  Server->>Client1: Game State Update (Broadcast)\n\n  Note over Client1,Client2: Exchange Game Data via WebRTC\n  Client1->>Client2: Game Data (Peer-to-Peer)\n  Client2->>Client1: Game Data (Peer-to-Peer)\n\n  Note over Client1,Server: Additional Data Exchange (Optional)\n  Client1->>Server: Additional Data (e.g., chat, score)\n  Server->>Client1: Additional Data (e.g., chat, score)\n  Server->>Client2: Additional Data (Broadcast)',
        description:
          "Shows how two game clients establish WebSocket connections with the game server, set up WebRTC via a signaling server for peer-to-peer game data, and synchronize game state and additional data (e.g., chat, scores).",
      },
    ],
  },

  {
    category: "Class Diagram",
    diagrams: [
      {
        id: "3",
        name: "Class Diagram",
        code: "classDiagram\n  class AuthService {\n    +login(username, password)\n    +logout()\n    +refreshToken()\n  }\n  class User {\n    -id: int\n    -email: string\n    +getProfile()\n  }\n  class SessionManager {\n    +createSession()\n    +destroySession()\n  }\n  AuthService --> User\n  AuthService --> SessionManager",
        description:
          "OOP-style representation of classes and relationships in an authentication system.",
      },
      {
        id: "4",
        name: "Shopping Cart System",
        code: "classDiagram\n  class Product {\n    -id: int\n    -name: string\n    -price: float\n    +getDetails()\n  }\n\n  class CartItem {\n    -product: Product\n    -quantity: int\n    +getTotalPrice()\n  }\n\n  class Cart {\n    -items: List<CartItem>\n    +addItem(product, qty)\n    +removeItem(product)\n    +getTotal()\n  }\n\n  class Order {\n    -id: int\n    -items: List<CartItem>\n    -totalAmount: float\n    +placeOrder()\n  }\n\n  Cart --> CartItem\n  CartItem --> Product\n  Order --> CartItem",
        description:
          "Class diagram for an online shopping cart system showing product selection, cart items, and order processing.",
      },
      {
        id: "5",
        name: "Blockchain Wallet System",
        code: "classDiagram\n  class Wallet {\n    -privateKey: string\n    -publicKey: string\n    +signTransaction()\n    +getAddress()\n  }\n\n  class Transaction {\n    -from: string\n    -to: string\n    -amount: float\n    +validate()\n  }\n\n  class Blockchain {\n    -chain: List<Block>\n    +addBlock(block)\n    +verifyChain()\n  }\n\n  class Block {\n    -previousHash: string\n    -transactions: List<Transaction>\n    +calculateHash()\n  }\n\n  Wallet --> Transaction\n  Blockchain --> Block\n  Block --> Transaction",
        description:
          "Object-oriented class diagram representing a basic blockchain wallet system with transaction validation and block management.",
      },
    ],
  },

  {
    category: "State Diagram",
    diagrams: [
      {
        id: "4",
        name: "Authentication",
        code: "stateDiagram-v2\n  [*] --> LoggedOut\n  LoggedOut --> LoggingIn: Submit Credentials\n  LoggingIn --> LoggedIn: Success\n  LoggingIn --> LoggedOut: Failure\n  LoggedIn --> Expired: Token Timeout\n  Expired --> LoggedOut\n  LoggedIn --> LoggedOut: Logout Click",
        description:
          "Describes the lifecycle of a user session with transitions based on events.",
      },
      {
        id: "5",
        name: "Order State Flow",
        code: "stateDiagram-v2\n  [*] --> CartCreated\n  CartCreated --> CheckoutInitiated: Proceed to Checkout\n  CheckoutInitiated --> PaymentProcessing: Enter Payment Info\n  PaymentProcessing --> OrderConfirmed: Payment Success\n  PaymentProcessing --> PaymentFailed: Payment Failure\n  PaymentFailed --> CheckoutInitiated: Retry Payment\n  OrderConfirmed --> Shipped: Dispatch\n  Shipped --> Delivered: Delivery Complete\n  Delivered --> [*]",
        description:
          "State diagram representing the lifecycle of an online order from cart creation to final delivery, including failure and retry paths.",
      },
      {
        id: "6",
        name: "Blockchain Transaction States",
        code: "stateDiagram-v2\n  [*] --> Created\n  Created --> Pending: Broadcast to Network\n  Pending --> Mined: Included in Block\n  Mined --> Confirmed: X Confirmations Reached\n  Pending --> Dropped: Timeout/Error\n  Dropped --> [*]\n  Confirmed --> [*]",
        description:
          "Visualizes the states a blockchain transaction goes through — from creation to confirmation or being dropped.",
      },
    ],
  },
  {
    category: "ER Diagram",
    diagrams: [
      {
        id: "5",
        name: "Entity Relationship Diagram",
        code: "erDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ ORDER_ITEM : contains\n  PRODUCT ||--|{ ORDER_ITEM : ordered\n  USER }|..|{ ADDRESS : has",
        description:
          "Complex ERD showing user-to-order relationships, many-to-many product ordering, and address linkage.",
      },
      {
        id: "16",
        name: "ERP ER Diagram",
        code: "erDiagram\n    USERS {\n        int user_id PK\n        string username\n        string password\n        string role\n    }\n    CUSTOMERS {\n        int customer_id PK\n        string customer_name\n        string email\n        string phone\n    }\n    PRODUCTS {\n        int product_id PK\n        string product_name\n        decimal price\n        string description\n    }\n    ORDERS {\n        int order_id PK\n        int customer_id FK\n        date order_date\n        decimal total\n    }\n    ORDER_ITEMS {\n        int order_item_id PK\n        int order_id FK\n        int product_id FK\n        int quantity\n    }\n    INVENTORY {\n        int inventory_id PK\n        int product_id FK\n        int quantity\n    }\n    SUPPLIERS {\n        int supplier_id PK\n        string supplier_name\n        string email\n        string phone\n    }\n    PURCHASE_ORDERS {\n        int purchase_order_id PK\n        int supplier_id FK\n        date purchase_order_date\n        decimal total\n    }\n    PURCHASE_ORDER_ITEMS {\n        int purchase_order_item_id PK\n        int purchase_order_id FK\n        int product_id FK\n        int quantity\n    }\n\n    USERS ||--o{ ORDERS : places\n    CUSTOMERS ||--o{ ORDERS : places\n    ORDERS ||--o{ ORDER_ITEMS : contains\n    PRODUCTS ||--o{ ORDER_ITEMS : contains\n    PRODUCTS ||--o{ INVENTORY : has\n    SUPPLIERS ||--o{ PURCHASE_ORDERS : places\n    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : contains\n    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : contains",
        description:
          "ER diagram modeling an e-commerce system with users, customers, products, orders, order items, inventory, suppliers, purchase orders, and purchase order items, showing primary and foreign keys and their relationships.",
      },
    ],
  },
  {
    category: "Gantt Diagram",
    diagrams: [
      {
        id: "6",
        name: "Gantt Chart",
        code: "gantt\n  title Project Timeline\n  dateFormat  YYYY-MM-DD\n  section Planning\n  Requirements Gathering :done, a1, 2025-05-01, 7d\n  Design :a2, after a1, 5d\n  section Development\n  Frontend :active, a3, after a2, 10d\n  Backend :a4, after a2, 10d\n  section Testing\n  Unit Tests :a5, after a4, 5d\n  Integration Tests :a6, after a5, 5d\n  section Deployment\n  Deploy to Staging :a7, after a6, 2d\n  Deploy to Production :a8, after a7, 1d",
        description:
          "Multi-phase Gantt chart showing dependencies and parallel execution across different project stages.",
      },
      {
        id: "7",
        name: "Product Launch Roadmap",
        code: "gantt\n  title Product Launch Timeline\n  dateFormat  YYYY-MM-DD\n  section Market Research\n  Competitor Analysis :done, m1, 2025-04-01, 10d\n  User Interviews :done, m2, 2025-04-05, 7d\n  section Design\n  UX Wireframes :m3, after m2, 8d\n  UI Mockups :m4, after m3, 6d\n  section Development\n  MVP Frontend :active, d1, after m4, 14d\n  MVP Backend :d2, after m4, 14d\n  API Integration :d3, after d2, 6d\n  section QA & Launch\n  QA Testing :d4, after d3, 5d\n  Beta Launch :d5, after d4, 2d\n  Public Launch :d6, after d5, 1d",
        description:
          "A detailed roadmap tracking product launch from market research through development and final release.",
      },
      {
        id: "8",
        name: "Research Project Plan",
        code: "gantt\n  title Research Project Timeline\n  dateFormat  YYYY-MM-DD\n  section Proposal Phase\n  Topic Selection :done, r1, 2025-01-10, 7d\n  Literature Review :done, r2, after r1, 14d\n  Proposal Submission :done, r3, after r2, 3d\n  section Experimentation\n  Lab Setup :r4, 2025-02-10, 5d\n  Data Collection :r5, after r4, 15d\n  Data Analysis :r6, after r5, 10d\n  section Documentation\n  Draft Writing :r7, after r6, 7d\n  Review & Feedback :r8, after r7, 4d\n  Final Report Submission :r9, after r8, 3d",
        description:
          "Academic research timeline showing structured phases from proposal through to final documentation.",
      },
    ],
  },
  {
    category: "Pie Chart",
    diagrams: [
      {
        id: "7",
        name: "Pie Chart",
        code: 'pie\n  title Resource Allocation\n  "Engineering" : 40\n  "Marketing" : 25\n  "Design" : 15\n  "QA" : 10\n  "Operations" : 10',
        description: "Breakdown of team resource allocation in percentages.",
      },
      {
        id: "8",
        name: "Annual Budget Breakdown",
        code: 'pie\n  title Annual Budget Allocation\n  "Salaries" : 50\n  "Infrastructure" : 20\n  "R&D" : 15\n  "Marketing" : 10\n  "Miscellaneous" : 5',
        description:
          "Shows how the annual budget is distributed across key departments.",
      },
      {
        id: "9",
        name: "User Demographics",
        code: 'pie\n  title User Demographics by Region\n  "North America" : 35\n  "Europe" : 25\n  "Asia" : 30\n  "South America" : 5\n  "Other" : 5',
        description:
          "Represents the geographic distribution of users by percentage.",
      },
    ],
  },
  {
    category: "Requirement Diagram",
    diagrams: [
      {
        id: "8",
        name: "Requirement Diagram",
        code: 'graph TD\n  loginReq["R1: Login with email/password"]\n  twoFAReq["R2: 2FA using TOTP"]\n  secureStorage["R3: Store passwords using bcrypt"]\n  loginReq --> secureStorage\n  loginReq --> twoFAReq',
        description:
          "Simulates a requirement diagram using flowchart syntax in Mermaid for compatibility.",
      },
      {
        id: "9",
        name: "Payment System Requirements",
        code: 'graph TD\n  paymentReq1["R1: Accept credit/debit cards"]\n  paymentReq2["R2: Support UPI & wallets"]\n  securityReq["R3: PCI-DSS compliance"]\n  loggingReq["R4: Transaction logging"]\n  fraudDetect["R5: Fraud detection"]\n  paymentReq1 --> securityReq\n  paymentReq2 --> securityReq\n  securityReq --> fraudDetect\n  fraudDetect --> loggingReq',
        description:
          "Outlines core requirements for a digital payment system with security and compliance dependencies.",
      },
      {
        id: "10",
        name: "Healthcare App Requirements",
        code: 'graph TD\n  patientReg["R1: Patient registration"]\n  appointmentBooking["R2: Book appointments"]\n  prescriptionUpload["R3: Upload prescriptions"]\n  telemedicine["R4: Enable video consultation"]\n  ehrSecurity["R5: Encrypt health records"]\n  patientReg --> appointmentBooking\n  appointmentBooking --> prescriptionUpload\n  prescriptionUpload --> ehrSecurity\n  telemedicine --> ehrSecurity',
        description:
          "Defines functional and security requirements for a healthcare mobile/web app.",
      },
    ],
  },
  {
    category: "User Journey Diagram",
    diagrams: [
      {
        id: "9",
        name: "User Journey Diagram",
        code: "journey\n  title User Onboarding Journey\n  section Signup\n    Visit Page: 3: User\n    Fill Form: 4: User\n    Submit Form: 5: User\n  section Post Signup\n    Email Verification: 4: User\n    First Login: 3: User\n    Explore Dashboard: 5: User",
        description:
          "Tracks a new user’s path from signup to engagement within the app.",
      },
      {
        id: "10",
        name: "Subscription Journey",
        code: "journey\n  title Premium Subscription Flow\n  section Onboarding\n    Land on Pricing Page: 3: User\n    Compare Plans: 4: User\n    Click Subscribe: 4: User\n  section Payment\n    Enter Card Details: 5: User\n    Confirm Payment: 5: User\n    Payment Success: 3: System\n  section After Subscription\n    Access Premium Features: 5: User\n    Receive Welcome Email: 4: System",
        description:
          "Illustrates the complete journey from viewing pricing to accessing premium features post-subscription.",
      },
      {
        id: "11",
        name: "Bug Reporting Flow",
        code: "journey\n  title Issue Reporting Experience\n  section Encounter Bug\n    Bug Occurs: 5: User\n    Try to Reproduce: 4: User\n  section Report Issue\n    Open Feedback Panel: 4: User\n    Submit Bug Report: 5: User\n    Auto-Acknowledge: 3: System\n  section Resolution\n    Dev Assigned: 4: System\n    Fix Released: 3: System\n    User Notified: 4: System",
        description:
          "Details the user’s experience from facing a bug to receiving a fix.",
      },
    ],
  },
  {
    category: "Git Graph",
    diagrams: [
      {
        id: "10",
        name: "Git Graph",
        code: 'gitGraph\n  commit id: "a1" tag: "v1.0"\n  branch feature/login\n  checkout feature/login\n  commit id: "a2"\n  commit id: "a3" tag: "login-complete"\n  checkout main\n  merge feature/login tag: "v1.1"\n  branch feature/2fa\n  checkout feature/2fa\n  commit\n  checkout main\n  merge feature/2fa tag: "v1.2"',
        description:
          "Visual representation of branching, tagging, and merging in a typical Git workflow.",
      },
      {
        id: "11",
        name: "Advanced Git Flow",
        code: 'gitGraph\n  commit id: "init" tag: "v0.1"\n  branch develop\n  checkout develop\n  commit id: "base"\n  branch feature/auth\n  checkout feature/auth\n  commit id: "auth-1"\n  commit id: "auth-2"\n  checkout develop\n  merge feature/auth tag: "v0.2"\n  branch feature/payment\n  checkout feature/payment\n  commit id: "pay-1"\n  commit id: "pay-2"\n  branch hotfix/urgent-bug\n  checkout hotfix/urgent-bug\n  commit id: "hotfix-1" tag: "v0.2.1"\n  checkout develop\n  merge hotfix/urgent-bug\n  checkout feature/payment\n  commit id: "pay-3"\n  checkout develop\n  merge feature/payment tag: "v0.3"\n  checkout main\n  merge develop tag: "v1.0"',
        description:
          "Illustrates a robust Git strategy with development, feature branches, hotfixes, and tagged releases aligned to semantic versioning.",
      },
    ],
  },
  {
    category: "Mindmap",
    diagrams: [
      {
        id: "11",
        name: "Mindmap",
        code: "mindmap\n  Root((Tech Stack))\n    Frontend\n      React\n      TailwindCSS\n      Vite\n    Backend\n      Node.js\n      Express\n      Prisma\n    DevOps\n      Docker\n      GitHub Actions\n      AWS",
        description:
          "Tech stack organized into frontend, backend, and DevOps with tools under each category.",
      },
      {
        id: "12",
        name: "Web Development Mindmap",
        code: "mindmap\n  Root((Web Development))\n    Frontend\n      React\n      Vue.js\n      Angular\n      CSS Frameworks\n        TailwindCSS\n        Bootstrap\n    Backend\n      Node.js\n      Django\n      Ruby on Rails\n      Databases\n        PostgreSQL\n        MongoDB\n    DevOps\n      Docker\n      Kubernetes\n      CI/CD\n        GitHub Actions\n        Jenkins",
        description:
          "Comprehensive mindmap breaking down key technologies and tools in modern web development.",
      },
      {
        id: "13",
        name: "Data Science Mindmap",
        code: "mindmap\n  Root((Data Science))\n    Data Collection\n      APIs\n      Web Scraping\n      Databases\n    Data Processing\n      Pandas\n      NumPy\n      SQL\n    Machine Learning\n      Supervised\n        Regression\n        Classification\n      Unsupervised\n        Clustering\n        Dimensionality Reduction\n    Visualization\n      Matplotlib\n      Seaborn\n      Plotly",
        description:
          "Organized visualization of main areas and tools within data science workflows.",
      },
    ],
  },
  {
    category: "Timeline",
    diagrams: [
      {
        id: "12",
        name: "Timeline",
        code: "timeline\n  title Startup Growth Timeline\n  2023-01 : Product Ideation\n  2023-04 : MVP Launched\n  2023-07 : Seed Funding Raised\n  2023-12 : 10K Users\n  2024-06 : Series A Round",
        description:
          "Chronological representation of major startup milestones.",
      },
      {
        id: "13",
        name: "Academic Journey Timeline",
        code: "timeline\n  title Academic Milestones\n  2018-08 : Started Undergraduate\n  2022-05 : Internship at Company X\n  2023-06 : Research Paper Published\n  2024-04 : Started Master’s Program\n  2025-05 : Thesis Submission",
        description: "Tracks key academic milestones over the years.",
      },
      {
        id: "14",
        name: "Product Development Cycle",
        code: "timeline\n  title Product Development Phases\n  2025-01 : Market Research\n  2025-03 : Prototype Development\n  2025-06 : Beta Testing\n  2025-09 : Launch\n  2025-12 : Feedback & Iteration",
        description:
          "Visual timeline showing phases from research to launch and iteration.",
      },
    ],
  },
  {
    category: "Quadrant Chart",
    diagrams: [
      {
        id: "13",
        name: "Quadrant Chart",
        code: 'quadrantChart\n  title Features Prioritization\n  x-axis Ease of Implementation --> Hard\n  y-axis Low Value --> High Value\n  quadrant-1 Quick Wins\n  quadrant-2 High Value, Hard\n  quadrant-3 Low Priority\n  quadrant-4 Traps\n  "Login with Google" : [0.2, 0.9]\n  "Offline Mode" : [0.8, 0.8]\n  "Dark Mode" : [0.3, 0.6]',
        description:
          "Decision-making tool for feature prioritization based on value and effort.",
      },
      {
        id: "14",
        name: "Product Features Prioritization",
        code: 'quadrantChart\n  title Feature Prioritization\n  x-axis Easy --> Hard\n  y-axis Low Impact --> High Impact\n  quadrant-1 Quick Wins\n  quadrant-2 Major Projects\n  quadrant-3 Low Priority\n  quadrant-4 Time Sinks\n  "Social Sharing" : [0.1, 0.8]\n  "Advanced Analytics" : [0.7, 0.9]\n  "Bug Fixes" : [0.2, 0.3]\n  "Refactor Code" : [0.9, 0.2]',
        description:
          "Classifies product features by ease and impact for prioritization.",
      },
      {
        id: "15",
        name: "Risk Assessment",
        code: 'quadrantChart\n  title Risk Assessment\n  x-axis Low Likelihood --> High Likelihood\n  y-axis Low Impact --> High Impact\n  quadrant-1 Monitor\n  quadrant-2 Mitigate\n  quadrant-3 Accept\n  quadrant-4 Avoid\n  "Data Breach" : [0.7, 0.9]\n  "Server Downtime" : [0.5, 0.7]\n  "Minor Bugs" : [0.3, 0.2]\n  "User Error" : [0.8, 0.4]',
        description:
          "Visualizes risks by their likelihood and impact for decision making.",
      },
      {
        id: "16",
        name: "Customer Segmentation",
        code: 'quadrantChart\n  title Customer Segmentation\n  x-axis Low Engagement --> High Engagement\n  y-axis Low Value --> High Value\n  quadrant-1 Potential Champions\n  quadrant-2 Loyal Customers\n  quadrant-3 Low Priority\n  quadrant-4 At Risk\n  "User A" : [0.9, 0.8]\n  "User B" : [0.4, 0.7]\n  "User C" : [0.2, 0.3]\n  "User D" : [0.7, 0.1]',
        description:
          "Classifies customers by engagement and value for marketing focus.",
      },
    ],
  },
  {
    category: "C4 Context Diagram",
    diagrams: [
      {
        id: "14",
        name: "C4 Context Diagram",
        code: 'C4Context\n  Person(customer, "Customer", "Uses the banking system to manage accounts and transactions")\n  System(bankingSystem, "Banking System", "Allows customers to view balances, transfer funds, and pay bills")\n  System_Ext(paymentGateway, "Payment Gateway", "Third-party service for processing payments")\n  System_Ext(notificationService, "Notification Service", "Sends SMS and email alerts")\n\n  Rel(customer, bankingSystem, "Uses for account management and transactions")\n  Rel(bankingSystem, paymentGateway, "Integrates with for payment processing")\n  Rel(bankingSystem, notificationService, "Sends transaction alerts via")',
        description:
          "A C4 Context diagram showing the Customer, the core Banking System, and its integrations with a Payment Gateway and a Notification Service.",
      },
      {
        id: "15",
        name: "Extended C4 Context Diagram",
        code: 'C4Context\n  Person(customer, "Customer", "Uses the banking system to manage accounts and transactions")\n  Person(bankEmployee, "Bank Employee", "Manages customer accounts and handles support")\n  System(bankingSystem, "Banking System", "Allows customers to view balances, transfer funds, and pay bills")\n  System_Ext(paymentGateway, "Payment Gateway", "Third-party service for processing payments")\n  System_Ext(notificationService, "Notification Service", "Sends SMS and email alerts")\n  System_Ext(creditScoreService, "Credit Score Service", "Provides credit scores for loan applications")\n\n  Rel(customer, bankingSystem, "Uses for account management and transactions")\n  Rel(bankEmployee, bankingSystem, "Manages accounts and processes customer requests")\n  Rel(bankingSystem, paymentGateway, "Integrates with for payment processing")\n  Rel(bankingSystem, notificationService, "Sends transaction alerts via")\n  Rel(bankingSystem, creditScoreService, "Requests credit scores during loan approvals")',
        description:
          "An extended C4 Context diagram depicting customers, bank employees, the banking system, and its key external integrations including payment, notifications, and credit scoring.",
      },
    ],
  },
  {
    category: "C4 Context Diagram",
    diagrams: [
      {
        id: "17",
        name: "Packet Diagram",
        code: 'packet-beta\n  0-15: "Source Port"\n  16-31: "Destination Port"\n  32-63: "Sequence Number"\n  64-95: "Acknowledgment Number"\n  96-99: "Data Offset"\n  100-105: "Reserved"\n  106: "URG"\n  107: "ACK"\n  108: "PSH"\n  109: "RST"\n  110: "SYN"\n  111: "FIN"\n  112-127: "Window"\n  128-143: "Checksum"\n  144-159: "Urgent Pointer"\n  160-191: "(Options and Padding)"\n  192-255: "Data (variable length)"',
        description:
          "Detailed breakdown of the TCP packet structure showing bit ranges and field names.",
      },
      {
        "id": "18",
        "name": "IPv4 Packet Header",
        "code": "packet-beta\n  0-3: \"Version\"\n  4-7: \"IHL (Header Length)\"\n  8-15: \"Type of Service\"\n  16-31: \"Total Length\"\n  32-47: \"Identification\"\n  48-50: \"Flags\"\n  51-63: \"Fragment Offset\"\n  64-71: \"Time to Live\"\n  72-79: \"Protocol\"\n  80-95: \"Header Checksum\"\n  96-127: \"Source IP Address\"\n  128-159: \"Destination IP Address\"\n  160-191: \"Options (if any)\"\n  192-255: \"Data (variable length)\"",
        "description": "Breakdown of the IPv4 header fields, showing bit positions for version, IHL, TOS, total length, identification, flags, fragment offset, TTL, protocol, checksum, source/destination addresses, options, and data."
      }
      
    ],
  },
  {
    category: "Block Diagram",
    diagrams: [
      {
        id: "19",
        name: "Block Diagram",
        code: 'block-beta\n  columns 3\n  doc>"Document"]:3\n  space down1<[" "]>(down) space\n\n  block:e:3\n          l["left"]\n          m("A wide one in the middle")\n          r["right"]\n  end\n    space down2<[" "]>(down) space\n    db[("DB")]:3\n    space:3\n    D space C\n    db --> D\n    C --> db\n    D --> C\n    style m fill:#d6d,stroke:#333,stroke-width:4px',
        description:
          "A block diagram with 3 columns featuring a document, a middle wide block styled distinctly, and a database block with bidirectional connections.",
      },
      {
        id: "20",
        name: "Microservices Architecture",
        code: 'block-beta\n  columns 4\n  client["Client App"]\n  space\n  api["API Gateway"]:2\n  auth["Auth Service"]\n  user["User Service"]\n  data["Data Processor"]:2\n  db["Database"]\n\n  client --> api\n  api --> auth\n  api --> user\n  user --> data\n  data --> db\n\n  style api fill:#bbf,stroke:#333,stroke-width:2px\n  style data fill:#dfd,stroke:#222,stroke-width:2px',
        description:
          "A block diagram of a microservices architecture showing a client app communicating via an API Gateway, with services like Auth, User, and Data Processor leading to a shared database.",
      },
    ],
  },
  {
    category: "Bar Graph",
    diagrams: [
      {
        id: "21",
        name: "Sales Revenue XY Chart",
        code: 'xychart-beta\n  title "Sales Revenue"\n  x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]\n  y-axis "Revenue (in $)" 4000 --> 11000\n  bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]\n  line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]',
        description:
          "A combined bar and line XY chart depicting monthly sales revenue with the y-axis range from 4000 to 11000 dollars.",
      },
      {
        id: "22",
        name: "Sales Performance Overview",
        code: 'xychart-beta\n  title "Sales vs Profit vs Growth"\n  x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]\n  y-axis "Amount ($)" 0 --> 12000\n  bar "Revenue" [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]\n  bar "Profit" [1200, 1400, 1800, 2100, 2500, 2900, 3100, 2800, 2600, 2400, 1900, 1600]\n  line "Growth %" [5, 6, 8, 9, 10, 12, 15, 13, 11, 9, 7, 5]',
        description:
          "An advanced multi-series XY chart showing monthly revenue, profit, and growth rate. Revenue and profit are represented as bars, while growth percentage is visualized with a line.",
      },
      {
        id: "23",
        name: "Regional Revenue Comparison",
        code: 'xychart-beta\n  title "North vs South Sales"\n  x-axis [Q1, Q2, Q3, Q4]\n  y-axis "Revenue (in $K)" 0 --> 25000\n  bar "North Region" [12000, 15000, 18000, 20000]\n  bar "South Region" [10000, 14000, 16000, 19000]\n  line "Combined Revenue" [22000, 29000, 34000, 39000]',
        description:
          "Quarterly revenue comparison between North and South regions using grouped bars and a line for total combined revenue.",
      },
      {
        id: "24",
        name: "Marketing ROI Analysis",
        code: 'xychart-beta\n  title "Marketing Spend vs Leads"\n  x-axis [jan, feb, mar, apr, may, jun]\n  y-axis "Spend & Leads" 0 --> 20000\n  bar "Ad Spend" [8000, 10000, 12000, 11000, 9500, 10500]\n  line "Leads Generated" [200, 250, 400, 370, 320, 390]',
        description:
          "Visualizes the relationship between monthly marketing spend and the number of leads generated using a bar-line chart.",
      },
      {
        id: "25",
        name: "Sales Target Tracker",
        code: 'xychart-beta\n  title "Actual vs Target Sales"\n  x-axis [jan, feb, mar, apr, may, jun]\n  y-axis "Sales (in $)" 0 --> 15000\n  bar "Actual Sales" [7000, 8500, 9000, 11000, 10500, 12000]\n  line "Target Sales" [8000, 9000, 9500, 11500, 11000, 12500]',
        description:
          "Shows monthly actual sales versus targets to assess team performance, with bars for actuals and a line for targets.",
      },
    ],
  },
];
