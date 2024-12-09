import { Devvit, useState, useInterval } from '@devvit/public-api';

Devvit.configure({
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
      switch (action) {
        case 'attack':
          if (Math.random() > 0.5) {
            setPoints((prev) => prev + 10);
            newEvent = 'Monster successfully attacked the community! +10 points';
            meme = 'https://example.com/attack_meme.jpg';
          } else {
            setPoints((prev) => Math.max(0, prev - 5));
            newEvent = 'Monster encountered defenses! -5 points';
            meme = 'https://example.com/defense_meme.jpg';
          }
          break;
        case 'defend':
          setDefense((prev) => prev + 10);
          newEvent = 'Defense increased by 10!';
          meme = 'https://example.com/defend_meme.jpg';
          break;
        default:
          break;
      }
      if (newEvent) {
        const eventId = Date.now();
        const expiryTime = Date.now() + 5000;
        setEvents((prev) => [...prev, { id: eventId, text: newEvent, meme, expiry: expiryTime }]);
      }
    };

    const chooseCommunity = (type: string) => setCommunity(type);

    const endGame = () => {
      const winner = community === 'monsters' ? 'Monsters' : 'Survivors';
      const celebrationMeme = 'https://example.com/celebration_meme.jpg';
      return (
        <vstack gap="medium" alignment="center middle">
          <text size="large" weight="bold" color="#fff">
            Game Over! {winner} Win!
          </text>
          <image url={celebrationMeme} height="120px" width="120px" imageHeight={80} imageWidth={80} />
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
        backgroundColor="linear-gradient(90deg, #F26101, #08AEEA)"
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
            <text size="large" weight="bold">
              Choose Your Community
            </text>
            <hstack gap="medium">
              <button appearance="primary" onPress={() => chooseCommunity('monsters')}>
                Monsters
              </button>
              <button appearance="primary" onPress={() => chooseCommunity('survivors')}>
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
            <text size="small" color="#f9f9f9">
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
              <button appearance="primary" onPress={() => performAction('attack')}>
                Attack
              </button>
              <button appearance="primary" onPress={() => performAction('defend')}>
                Defend
              </button>
            </hstack>

            <vstack
              gap="small"
              alignment="center middle"
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
                      height="60px"
                      width="60px"
                      imageHeight={60}
                      imageWidth={60}
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
