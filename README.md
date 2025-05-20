# Battle Ship Game

[Assignment link](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/battleship/assignment.md)

## 📋 Prerequisites

- Node.js >= 22.14.0
- npm (Node Package Manager)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/salandil/battle-ship
cd battle-ship
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp env.example .env
```

## 🎮 Running the Game

Player interface for your battleship backend is here: https://github.com/rolling-scopes-school/websockets-ui.
You should clone or copy this repository.
To start the ui interface:
```bash
npm run start
```

To start the backend server:

```bash
npm run start
```

The server will start in development mode with hot-reloading enabled.<be>
It's default port is 3000. Could be confinguired in .env file.

## Game Notes:

- the backend server and ui are in different repositories, 
  to run the ui part you need to clone or copy it from here: https://github.com/rolling-scopes-school/websockets-ui
  and run it separately from the backend server.
- Player is added to the room right automatically when create a room
- When hit already shot ship or already missed point, the next player turn comes.
