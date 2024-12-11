# Subreddit Survival Game

Welcome to the **Subreddit Survival** game, a community-driven challenge where participants can join either the **Survivors** or **Mantis** community and engage in various actions to survive and thrive. This game is built with **Devvit** and allows Reddit community members to interact in a shared game environment, where their actions have direct impacts on the outcome of the game.

## Table of Contents

- [Game Overview](#game-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Game Mechanics](#game-mechanics)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Game Overview

In the **Subreddit Survival** game, two communities (Survivors and Mantis) battle for dominance through resource management, defense building, and attack strategies. Players can choose which community they wish to support, and each community’s success is based on its points and defense. Players’ actions, such as attacking or defending, impact the game state.

This game is powered by **Devvit**, an API that integrates with Reddit to create interactive and persistent games that users can enjoy directly in their subreddit.

### Key Features:
- **Community Selection**: Users can choose between two communities: Survivors or Mantis.
- **Game Actions**: Players can attack or defend, which impacts their community's points and defense level.
- **Shared State**: The game state is synchronized across all users using Devvit's `kvStore`, ensuring that everyone's actions are reflected in real-time.
- **Countdown Timer**: The game runs on a timer, and the winner is determined at the end of the time period based on the accumulated points.
- **Event System**: Random events occur, and players are notified of the outcomes with associated memes.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/subreddit-survival.git
    cd subreddit-survival
    ```

2. **Install dependencies**:
    - Ensure you have `Node.js` installed (preferably the latest LTS version).
    - Run the following command to install dependencies:
    ```bash
    npm install
    ```

3. **Start the project**:
    ```bash
    npm start
    ```

This will start the application locally. You will need a Devvit environment set up to fully interact with Reddit’s API and the game’s functionality.

## Usage

1. **Choose a Community**:
   - Players are prompted to choose either the **Mantis** or **Survivors** community. This action is persisted across all game sessions using `kvStore`.

2. **Actions**:
   - Players can choose between **Attack** or **Defend**. Each action influences their community's points and defense status.
   - If a player attacks the opposing community and succeeds, they gain points. If they fail, they lose points.
   - Defending successfully increases the defense level, while failure reduces the defense.

3. **Game Timer**:
   - A timer counts down, and when it reaches 0, the game ends and the winner is determined based on the points.

4. **Events**:
   - Random events occur during the game, such as a successful attack or a failed defense. These events are displayed in real-time, along with a meme representing the outcome.

5. **Shared State with `kvStore`**:
   - The game state (such as community choice, points, and defense) is stored using Devvit's `kvStore`. This ensures that the game’s state is shared across all participants in the community.

## Game Mechanics

- **Community**: Players choose between **Mantis** or **Survivors**. This choice is saved in the `kvStore` and is shared across the game.
- **Points**: Each community has a point system. Players gain points by attacking successfully and lose points if they fail or if they are attacked.
- **Defense**: Players can build a defense wall to protect their community. Successful defense adds points to the defense score, while failure decreases the defense.
- **Timer**: The game has a 5-minute countdown. After the timer reaches zero, the game ends, and the community with the highest points is declared the winner.
- **Events**: Random events are triggered during the game, such as successful or failed attacks, which add to the overall game experience.

### How the game state is managed:
- **Community choice** is stored in `kvStore` so that everyone in the community knows which side they’ve chosen.
- **Points** and **Defense** are stored in `kvStore` and updated every time an action is performed.
- The state is updated every second, so all players see the game’s current state in real-time.

## Technologies Used

- **Devvit**: The core framework used to build the game. Devvit is responsible for handling Reddit API interactions, game state management with `kvStore`, and UI rendering.
- **React**: The UI framework used to build the interactive elements of the game, such as the buttons for actions and the display of game information (points, defense, timer).
- **TypeScript**: TypeScript is used for strict typing and type safety throughout the application.
- **Reddit API**: The Reddit API is used to fetch information about the current subreddit and post updates about the game to the subreddit.

## Contributing

We welcome contributions! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to your branch (`git push origin feature-branch`).
6. Create a new pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
### Code Overview

The code is structured to use the **Devvit API**, which enables the integration with Reddit’s API for creating interactive posts and menus. Here's a breakdown of the key components in the code:

1. **Devvit Configuration**: 
   - The `Devvit.configure` method is used to enable the required plugins for the game (`kvStore` and `redditAPI`).

2. **Menu Item for Subreddit Survival**:
   - A menu item is created for moderators, allowing them to start the game by posting a message to the subreddit.

3. **Custom Post Type**:
   - The game is wrapped in a custom post type (`Survival Game`), allowing it to be displayed and interacted with on Reddit.

4. **State Management**:
   - The game uses `useState` for local state management (such as points, defense, and the community choice).
   - The game state is also synchronized across all users using `kvStore`, so the points, defense, and community choice persist.

5. **Game Actions**:
   - Users can choose actions like "Attack" or "Defend", which alter the game state and update the UI with new events.

6. **Game Timer**:
   - The timer counts down from 5 minutes, and when it reaches zero, the game ends and displays the results (the winner or a draw).

By following this setup, the game allows multiple community members to participate and see the impact of their actions in real-time.


