# FRONTEND
# __________________________________________________________________________________________

# Running the frontend

npm run dev

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# BACKEND
# __________________________________________________________________________________________

# Running the Backend 

 uvicorn app.main:app --reload 

# Backend Testing

Swagger (interactive): http://localhost:8000/docs

Redoc (read-only): http://localhost:8000/redoc

# Docker CLI Prompts

BUILD:              docker build -t climb-api . 

RUN:                docker run -d --name climb-api -p 80:80 --env-file .\.env -v C:\Users\coled\reptrac\backend\temp_uploads:/app/ temp_uploads climb-api
        
STOP IMG:           docker stop climb-api 

REMOVE IMG:         docker rm   climb-api

GET IMG ID:         docker ps -a 

GET LOGS:           docker logs -f climb-api 

# Elastic Beanstalk CLI

eb deploy 

# ECR

TAG THE IMAGE:      docker tag climb-api:latest 537124934274.dkr.ecr.us-east-2.amazonaws.com/climb-api:latest

PUSH TO ECR:        docker push 537124934274.dkr.ecr.us-east-2.amazonaws.com/climb-api:latest


#### PUSH TO EC2
scp -i "C:\Projects\RouteMap\route-map-server.pem" -r C:\Projects\routemap-ec2\frontend ec2-user@3.14.149.218:/home/ec2-user/


### PUSH TO S3
aws s3 sync .\dist\ s3://your-s3-bucket-name/ --delete
