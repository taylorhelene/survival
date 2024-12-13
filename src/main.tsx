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
    const [timer, setTimer] = useState(180); // 3 minutes in seconds
    const [community, setCommunity] = useState<string | null>(null);
    const [points, setPoints] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [events, setEvents] = useState<
      { id: number; text: string; meme: string; expiry: number }[]
    >([]);
    const [restartTimer, setRestartTimer] = useState<number | null>(null);

    const { kvStore } = context;

    const updateTotalPoints = async (type: string, value: number, key: string) => {
      const totalPointsKey = `${type}_${key}`;
      const currentTotal = (await kvStore.get(totalPointsKey)) || 0;
      const newTotal = (currentTotal as number) + value;
      await kvStore.put(totalPointsKey, newTotal);
    };

    const prefetchWinner = async () => {
      const survivorPoints = (await kvStore.get('survivors_points')) || 0;
      const mantisPoints = (await kvStore.get('mantis_points')) || 0;

      if (survivorPoints > mantisPoints) {
        setWinner('Players');
      } else if (mantisPoints > survivorPoints) {
        setWinner('Mantis');
      } else {
        setWinner('None');
      }
    };

    // Timer logic
    useInterval(async () => {
      if (timer > 0) {
        setTimer((prev) => prev - 1);
      } else if (timer === 0 && !winner) {
        await prefetchWinner();
        setRestartTimer(1800); // Set 30 mins restart timer
      }
    }, 1000).start();

    useInterval(() => {
      if (restartTimer !== null) {
        if (restartTimer > 0) {
          setRestartTimer((prev) => prev! - 1);
        } else {

          // Clear relevant kvStore data
          kvStore.put('survivors_points', 0);
          kvStore.put('mantis_points', 0);
          kvStore.put('community', null);
          kvStore.put('points', 0);
          kvStore.put('defense', 0);

          // Reset game state
          setTimer(180);
          setCommunity(null);
          setPoints(0);
          setDefense(0);
          setWinner(null);
          setEvents([]);
          setRestartTimer(null);
        }
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

    const performAction = async (action: 'attack' | 'defend') => {
      let newEvent = '';
      let meme = '';
      let updatedPoints = points;
      let updatedDefense = defense;

      if (action === 'attack') {
        if (Math.random() > 0.5) {
          updatedPoints += 10;
          newEvent = `${community} successfully explored! +10 points`;
          meme = community === 'survivors' ? 'camp.jpg' : 'mantis.jpg';
          await updateTotalPoints(community || '', 10, 'points');
        } else {
          updatedPoints = Math.max(0, updatedPoints - 5);
          newEvent = `${community} explore failed! -5 points`;
          meme = community === 'survivors' ? 'mantis.jpg' : 'camp.jpg';
        }
      } else if (action === 'defend') {
        if (Math.random() > 0.5) {
          updatedDefense += 10;
          newEvent = 'Defense improved! Defense +10';
          meme = 'wall.jpg';
          await updateTotalPoints(community || '', 10, 'defense');
        } else {
          updatedDefense = Math.max(0, updatedDefense - 10);
          newEvent = 'Defense failed! Defense -10';
          meme = 'fallen.jpg';
        }
      }

      kvStore.put('points', updatedPoints);
      kvStore.put('defense', updatedDefense);

      setPoints(updatedPoints);
      setDefense(updatedDefense);

      const eventId = Date.now();
      const expiryTime = Date.now() + 4000;
      setEvents((prev) => [
        ...prev,
        { id: eventId, text: newEvent, meme, expiry: expiryTime },
      ]);
    };

    const chooseCommunity = (type: string) => {
      setCommunity(type);
      kvStore.put('community', type);
    };

    const endGame = () => {
      const resultText =
        winner === 'None'
          ? 'No winner this time! Try harder next round!'
          : `${winner} are victorious with the highest points!`;
      const celebrationMeme = winner !== 'None' ? 'winner.jpg' : 'draw.jpg';

      return (
        <vstack gap="medium" alignment="center middle" backgroundColor="red" height={100}>
          <text size="large" weight="bold" color="#fff">
            Game Over! {resultText}
          </text>
          <image
            url={celebrationMeme}
            height="80px"
            width="80px"
            imageHeight={80}
            imageWidth={80}
          />
          {restartTimer !== null && (
            <text size="medium" weight="bold" color="#fff">
              Game restarting in: {formatTime(restartTimer)}
            </text>
          )}
        </vstack>
      );
    };

    if (timer === 0 && winner) return endGame();

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
            <vstack gap="medium" alignment="center" height="100%">
              <text size="large" weight="bold" style="heading">
                Choose Your Community In The Mantis Games!
              </text>
              <hstack gap="medium" height="30%">
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
                  Players
                </button>
              </hstack>

              <hstack gap='medium' height='30%' width='100%' alignment='center'>
                <vstack gap='medium' cornerRadius="full"  height="100%" width="15%" >
                  <image height="100%" width="100%" imageHeight={100} imageWidth={100} url='mantis.jpg' grow resizeMode='fill' />
                </vstack>
                <vstack gap='medium' cornerRadius="full"  height="100%" width="15%">
                  <image height="100%" width="100%" imageHeight='300px' imageWidth='300px' url='camp.jpg' grow resizeMode='fill' />
                </vstack>                
                
              </hstack>

            </vstack>
          )}

          {community && (
            <>
              <text size="large" weight="bold" color="#fff">
                Subreddit Mantis Games
              </text>
              <text size="medium" color="#f9f9f9" weight="bold" style="body">
                Time Left: {formatTime(timer)}
              </text>
              <hstack gap="large" alignment="middle center">
                <vstack alignment="center middle" gap="small">
                  <text size="medium" weight="bold" color="#fff">
                    Explore environment
                  </text>
                  <text size="small" color="#f9f9f9">{`Points 💥💥: ${points}`}</text>
                </vstack>
                <vstack alignment="center middle" gap="small">
                  <text size="medium" weight="bold" color="#fff">
                    Defending camp 
                  </text>
                  <text size="small" color="#f9f9f9">{`Defense 💥💥: ${defense}`}</text>
                </vstack>
              </hstack>
              <hstack gap="medium" alignment="center middle">
                <button
                  icon="crowd-control-outline"
                  appearance="primary"
                  onPress={() => performAction('attack')}
                >
                  Explore
                </button>
                <button appearance="primary" icon="world-outline" onPress={() => performAction('defend')}>
                  Defend
                </button>
              </hstack>
              <vstack  height={20}></vstack>
              <vstack
                gap="small"
                alignment="center bottom"
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
