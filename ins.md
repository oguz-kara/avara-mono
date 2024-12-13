Objective: Dockerize and deploy a NestJS app (GraphQL, Prisma, PostgreSQL) and a Next.js app (Material UI admin panel) to AWS ECS with Fargate, ensuring a quick and efficient initial deployment.

Requirements:

    Tech Stack: NestJS, Next.js, Prisma ORM, PostgreSQL.
    Docker: Dockerize each component.
    AWS ECS with Fargate: Deploy the services with minimal setup for scalability and maintainability.
    CI/CD: Setup GitHub Actions for automatic deployment on push to the main branch.
    Use pnpm instead of npm.
    

Expected Outputs:

    Docker Configuration:
        Dockerfiles for NestJS, Next.js, and PostgreSQL.
        Docker Compose for local development.
    AWS Deployment:
        Task definitions, ECS cluster, Fargate services, and environment variables setup. (I don't want to use AWS Secrets if possible)
        Use AWS Copilot CLI or AWS CLI for simplicity.
    GitHub Actions Workflow:
        Build and push Docker images to Amazon Elastic Container Registry (ECR).
        Deploy services to ECS.

Step-by-Step Instructions:

    Dockerize Applications:
        Create Dockerfiles for the NestJS and Next.js apps, ensuring production-ready optimizations.
        Use a standard PostgreSQL Docker image with persistent storage.
    ECS and Fargate Setup:
        Use AWS Copilot CLI for quick Fargate service deployment.
        Configure VPC, subnets, and security groups for the services.
    CI/CD with GitHub Actions:
        Define workflows for:
            Linting and testing.
            Building Docker images and pushing to ECR.
            Deploying services to ECS.

Best Practices:

    Parameterize environment variables using AWS Secrets Manager or SSM Parameter Store.
    Implement health checks for services.
    Use CloudWatch for monitoring logs.