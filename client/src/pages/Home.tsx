import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import Blog from "./Blog";
import { BlogType } from "../types";

const Home = () => {
  const blogs: BlogType[] = [
    {
      id: "1",
      title: "Serverless Functions",
      body: "# Serverless Functions\n\n## Introduction\n\n[Serverless functions](https://aws.amazon.com/serverless/) have revolutionized `cloud computing` by allowing developers to execute code without managing infrastructure. They enable automatic scaling, cost efficiency, and simplified deployment.\n\n## What Are Serverless Functions?\n\nServerless functions are event-driven, stateless computing services provided by cloud platforms like [AWS Lambda](https://aws.amazon.com/lambda/), [Google Cloud Functions](https://cloud.google.com/functions), and [Azure Functions](https://azure.microsoft.com/en-us/products/functions/). They run on demand in response to triggers such as HTTP requests, database changes, or scheduled events.\n\n## Benefits\n\n- **Scalability**: Automatically scales based on demand.\n- **Cost-Effective**: Pay only for actual execution time.\n- **Reduced Maintenance**: No need to manage servers.\n- **Faster Deployment**: Deploy code quickly without worrying about infrastructure.\n\n### Use Cases\n\n- **[Web APIs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Website_APIs)**: Handle HTTP requests efficiently.\n- **Data Processing**: Process large datasets asynchronously.\n- **IoT Applications**: Manage real-time data from IoT devices.\n- **Automated Workflows**: Run scheduled or event-triggered jobs.\n\n# Example: AWS Lambda Function\n\nHere is a simple AWS Lambda function in Python that responds to an HTTP request:\n\n```python\nimport json\n\ndef lambda_handler(event, context):\n    return {\n        'statusCode': 200,\n        'body': json.dumps('Hello from Lambda!')\n    }\n```\n\n## Challenges\n\n- **Cold Starts**: Initial execution delay for infrequently used functions.\n- **Vendor Lock-in**: Difficulty migrating between cloud providers.\n- **Limited Execution Time**: Functions often have execution time limits.\n\n## Conclusion\n\n[Serverless functions](https://en.wikipedia.org/wiki/Serverless_computing) provide a powerful way to build scalable and cost-effective applications. While they have challenges, their benefits make them an excellent choice for many use cases in modern cloud computing.",
      date: "2021-09-12",
      hastags: [
        "serverless",
        "cloud",
        "aws",
        "functions",
        "lambda",
        "azure",
        "gcp",
        "faas",
        "devops",
        "microservices",
        "scalability",
        "automation",
        "cloudcomputing",
        "eventdriven",
      ],
    },
    {
      id: "2",
      title: "Docker Containers",
      body: "# Docker Containers\n\n## Introduction\n\n[Docker](https://www.docker.com/) containers have transformed the way developers build, ship, and run applications. They provide lightweight, portable environments that ensure consistency across different platforms.\n\n## What Are Docker Containers?\n\nDocker containers are isolated environments that package an application and its dependencies together. They run on a shared operating system kernel and are more efficient than virtual machines.\n\n## Benefits\n\n- **Portability**: Run applications consistently across different environments.\n- **Isolation**: Keep applications and dependencies separate from the host system.\n- **Resource Efficiency**: Share the host OS kernel for faster startup times.\n- **Scalability**: Scale applications quickly by running multiple containers.\n\n### Use Cases\n\n- **Microservices**: Deploy and manage small, independent services.\n- **Continuous Integration/Deployment**: Build and test applications in isolated environments.\n- **Development Environments**: Create reproducible environments for local development.\n- **High-Performance Computing**: Run parallel workloads efficiently.\n\n# Example: Dockerfile\n\nHere is a simple Dockerfile that builds a Node.js application:\n\n```dockerfile\nFROM node:14\n\nWORKDIR /app\n\nCOPY package.json .\nCOPY index.js .\n\nRUN npm install\n\nCMD [\"node\", \"index.js\"]\n```\n\n## Challenges\n\n- **Security**: Ensure containers are secure and isolated from each other.\n- **Orchestration**: Manage and scale containers in production environments.\n- **Networking**: Connect containers together and to external services.\n\n## Conclusion\n\n[Docker containers](https://www.docker.com/resources/what-container) have become a standard tool for developers and operations teams. They offer a flexible and efficient way to package, deploy, and manage applications in a variety of environments.",
      date: "2021-09-15",
      hastags: [
        "docker",
        "containers",
        "devops",
        "microservices",
        "virtualization",
        "cloud",
        "kubernetes",
        "ci/cd",
        "isolation",
        "scalability",
        "portability",
        "security",
        "orchestration",
      ],
    },
  ];

  // extract the id from the URL
  const { id } = useParams();
  // filter the blog object based on the id
  const b = blogs.filter((blog) => blog.id === id)[0];

  return (
    <div>
      <Navigation />
      <Blog blog={b} />
    </div>
  );
};

export default Home;
