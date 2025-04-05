## EquiLoad - A Smart Load Balancer

EquiLoad is an intelligent, AI-powered load balancer that optimizes traffic distribution across backend servers. Users can easily configure their backend servers and select from a variety of load-balancing algorithms. Additionally, EquiLoad features an AI agent that assists users in selecting the best algorithm for their specific use case, based on their website's unique requirements. The AI agent asks a series of questions to understand the workload and provides personalized algorithm recommendations.

## Features

- **Custom Backend Configuration**: Users can input their backend server URLs for easy setup.
- **Zero Programming Required**: Setup and manage without writing a single line of code.
- **Algorithm Selection**: Choose from multiple load-balancing algorithms, or let the AI agent guide you.
- **AI Assistance**: The AI agent asks questions to understand your workload and suggests the optimal algorithm for your website.
- **Zero Configuration Files & Restarts**: Effortlessly add or remove servers without needing manual configuration files or server restarts.
- **Real-Time Monitoring**: Monitor server performance and request distribution with live updates.
- **Load Balancing Algorithms Supported**:
  - **Round Robin**: Distributes requests sequentially across the servers.
  - **Least Connections**: Routes traffic to the server with the fewest active connections.
  - **IP Hashing**: Routes requests based on the client's IP address, ensuring session persistence.
  - **AI-Assisted Recommendation**: The AI agent suggests the best algorithm based on the website's workload and user input.
  - **Random**: Distributes requests randomly across the available servers.
  - **Sticky Session**: Ensures that a client consistently connects to the same server based on their session, providing session persistence.


## Usage

1. **Enter your backend server URLs**: Input the URLs of your backend servers that will handle the requests.
2. **Select a Load-Balancing Algorithm**: Choose from multiple algorithms, or consult the AI agent for a recommendation.
3. **Enable AI Agent for Recommendations**: Let the AI agent help decide the best load-balancing strategy based on your use case.
4. **Enable ML-Based Prediction (Optional)**: Optionally, enable machine learning for automated decision-making to predict the optimal server.
5. **Monitor Server Performance**: Track the real-time performance, including CPU usage, memory consumption, active connections, and response time of your backend servers.
6. **Distribute Requests**: Once configured, the system will automatically route requests to the appropriate backend server based on the selected algorithm.

## Technologies Used

- _Backend_: Node.js, Express.js
- _Frontend_: Next.js, TypeScript, Tailwind CSS
- _Machine Learning_: Python, TensorFlow/Scikit-Learn (for prediction model)

## Setup Instructions

### _Frontend Setup_

```sh
cd web
npm install
npm run dev
```

### _Backend Setup_

```sh
cd server
npm install
npm run start:backend
```

### _Load Balancer & AI Integration_

```sh
# Open a new terminal and run:
node loadBalancer.js
```

## Screenshots Of Our Website

![Pic 1](https://github.com/user-attachments/assets/df685c8f-5edd-4174-8867-1fc41b8790d2)
![pic 2](https://github.com/user-attachments/assets/3fb150d9-42c3-4bcb-a04c-4b5dc2dc4b9e)
![pic 3](https://github.com/user-attachments/assets/0f867d5b-eef1-4f13-b530-a2a35875de25)
![pic_4](https://github.com/user-attachments/assets/6b73b72f-5d40-49c0-891c-ac5340ebef6b)
![pic 5](https://github.com/user-attachments/assets/e4637b74-ac37-436a-bdc4-bd18399ed9e1)
![pic 6](https://github.com/user-attachments/assets/30c448a7-a27f-49dc-99a0-f3be0154293b)
