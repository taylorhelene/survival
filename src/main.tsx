import { Devvit, useState, useInterval } from '@devvit/public-api';

Devvit.configure({
  kvStore: true,
  redditAPI: true,
});

Devvit.addMenuItem({
  label: 'Start Subreddit Survival',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    await reddit.submitPost({
      title: 'Subreddit Survival: Community Challenge!',
      subredditName: subreddit.name,
      text: 'Welcome to the Subreddit Survival challenge! Join the game and contribute to your community!',
    });

    ui.showToast({ text: 'Subreddit Survival post created!' });
  },
});

Devvit.addCustomPostType({
  name: 'Survival Game',
  height: 'regular',
  render: (context) => {
    const [resources, setResources] = useState({ food: 50, wood: 50 });
    const [population, setPopulation] = useState(10);
    const [defense, setDefense] = useState(0);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [community, setCommunity] = useState<string | null>(null);
    const [points, setPoints] = useState(0);
    const [events, setEvents] = useState<
      { id: number; text: string; meme: string; expiry: number }[]
    >([]);

    // kvStore setup
    const { kvStore } = context;

    // Synchronize the game state across community members using kvStore
    useInterval(async () => {
      const storedCommunity = await kvStore.get('community');
      if (storedCommunity) {
        setCommunity(storedCommunity as string); // Ensure it's a string or null
      }

      const storedPoints = await kvStore.get('points');
      if (storedPoints !== undefined) {
        setPoints(storedPoints as number); // Ensure it's a number
      }

      const storedDefense = await kvStore.get('defense');
      if (storedDefense !== undefined) {
        setDefense(storedDefense as number); // Ensure it's a number
      }
    }, 1000);

    useInterval(() => {
      if (timer > 0) {
        setTimer((prev) => prev - 1);
      }
    }, 1000).start();

    useInterval(() => {
      const currentTime = Date.now();
      setEvents((prev) => prev.filter((event) => event.expiry > currentTime));
    }, 1000).start();

    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const performAction = (action: 'attack' | 'defend') => {
      let newEvent = '';
      let meme = '';
      let updatedPoints = points;
      let updatedDefense = defense;
      switch (action) {
        case 'attack':
          if (community === 'survivors') {
            if (Math.random() > 0.5) {
              updatedPoints += 10;
              newEvent = 'Survivors attacked the Mantis community! +10 points';
              meme = 'camp.jpg';
            } else {
              updatedPoints = Math.max(0, updatedPoints - 5);
              newEvent = 'Survivors encountered Mantis defense! -5 points';
              meme = 'mantis.jpg';
            }
          } else {
            if (Math.random() > 0.5) {
              updatedPoints += 10;
              newEvent = 'Mantis successfully attacked the Survivors! +10 points';
              meme = 'mantis.jpg';
            } else {
              updatedPoints = Math.max(0, updatedPoints - 5);
              newEvent = 'Mantis encountered Survivors defense! -5 points';
              meme = 'camp.jpg';
            }
          }
          break;
        case 'defend':
          if (Math.random() > 0.5) {
            updatedDefense += 10;
            newEvent = 'Defense wall successfully built! Defense +10';
            meme = 'wall.jpg';
          } else {
            updatedDefense = Math.max(0, updatedDefense - 10);
            newEvent = 'Defense wall collapsed during construction! Defense -10';
            meme = 'fallen.jpg';
          }
          break;
        default:
          break;
      }

      // Update kvStore for shared game state
      if (newEvent) {
        kvStore.put('points', updatedPoints);
        kvStore.put('defense', updatedDefense);

        const eventId = Date.now();
        const expiryTime = Date.now() + 4000;
        setEvents((prev) => [
          ...prev,
          { id: eventId, text: newEvent, meme, expiry: expiryTime },
        ]);
      }
    };

    const chooseCommunity = (type: string) => {
      setCommunity(type);
      kvStore.put('community', type); // Save community choice to kvStore
    };

    const endGame = () => {
      const winner = points >= 50 ? (community === 'survivors' ? 'Survivors' : 'Mantis') : 'None';
      const celebrationMeme = winner !== 'None' ? 'winner.jpg' : 'draw.jpg';
      const resultText =
        winner === 'None'
          ? 'No winner this time! Try harder next round!'
          : `${winner} are victorious with the highest points!`;

      return (
        <vstack gap="medium" alignment="center middle" backgroundColor="red" height={100}>
          <text size="large" weight="bold" color="#fff">
            Game Over! {resultText}
          </text>
          <image url={celebrationMeme} height="80px" width="80px" imageHeight={80} imageWidth={80} />
        </vstack>
      );
    };

    if (timer === 0) return endGame();

    return (
      <vstack
        height="100%"
        width="100%"
        gap="medium"
        alignment="center middle"
        backgroundColor="#F26101"
        padding="small"
        border="thin"
        cornerRadius="small"
      >
        <vstack
          height="100%"
          width="100%"
          backgroundColor="rgba(8, 174, 234, 0.5)" // 50% opacity
        >
          {!community && (
            <vstack gap="medium" alignment="center">
              <text size="large" weight="bold" style="heading">
                Choose Your Community In The Mantis Wars!
              </text>
              <hstack gap="medium">
                <button
                  appearance="primary"
                  icon="topic-homegarden-outline"
                  onPress={() => chooseCommunity('mantis')}
                >
                  Mantis
                </button>
                <button
                  appearance="primary"
                  icon="topic-sports"
                  onPress={() => chooseCommunity('survivors')}
                >
                  Survivors
                </button>
              </hstack>
            </vstack>
          )}

          {community && (
            <>
              <text size="large" weight="bold" color="#fff">
                Subreddit Survival
              </text>
              <text size="medium" color="#f9f9f9" weight="bold" style="body">
                Time Left: {formatTime(timer)}
              </text>

              <hstack gap="large" alignment="middle center">
                <vstack alignment="center middle" gap="small">
                  <text size="medium" weight="bold" color="#fff">
                    Points
                  </text>
                  <text size="small" color="#f9f9f9">{`Points: ${points}`}</text>
                </vstack>
                <vstack alignment="center middle" gap="small">
                  <text size="medium" weight="bold" color="#fff">
                    Defense
                  </text>
                  <text size="small" color="#f9f9f9">{`Defense: ${defense}`}</text>
                </vstack>
              </hstack>

              <hstack gap="medium" alignment="center middle">
                <button icon="crowd-control-outline" appearance="primary" onPress={() => performAction('attack')}>
                  Attack
                </button>
                <button appearance="primary" icon="world-outline" onPress={() => performAction('defend')}>
                  Defend
                </button>
              </hstack>
            <vstack
            height={20}
            >

            </vstack>
              <vstack
                gap="small"
                alignment='center bottom'
                width="100%"
                height="120px"
                backgroundColor="#222"
                border="thin"
                cornerRadius="small"
              >
                {events.map((event) => (
                  <vstack
                    key={event.id.toString()}
                    alignment="center middle"
                    backgroundColor="#333"
                    padding="small"
                    cornerRadius="small"
                    width="90%"
                  >
                    <text color="#fff">{event.text}</text>
                    {event.meme && (
                      <image
                        url={event.meme}
                        height="80px"
                        width="80px"
                        imageHeight={80}
                        imageWidth={80}
                      />
                    )}
                  </vstack>
                ))}
              </vstack>
            </>
          )}
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
