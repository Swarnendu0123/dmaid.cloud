export const default_code = `%% Complex flowchart with decisions, loops, and subgraphs
graph TD;
  A[Start] --> B{User Authenticated?};
  B -- Yes --> C[Load Dashboard];
  B -- No --> D[Show Login Screen];

  subgraph "Authentication Process"
    D --> E{Valid Credentials?};
    E -- Yes --> F[Redirect to Dashboard];
    E -- No --> G[Show Error Message];
    G -->|Retry| D;
  end

  C --> H{Has Notifications?};
  H -- Yes --> I[Show Notifications Panel];
  H -- No --> J[Skip];

  subgraph "User Actions"
    I --> K[View Messages];
    K --> L{Respond?};
    L -- Yes --> M[Open Reply Window];
    L -- No --> N[Close Panel];
  end

  J --> O{Check Permissions};
  O -- Admin --> P[Show Admin Panel];
  O -- User --> Q[Show User Dashboard];

  P --> R[Manage Users];
  P --> S[View Reports];
  Q --> T[Edit Profile];
  Q --> U[View Purchases];

  R & S & T & U --> V[Logout];
  V --> W[End];
`;
