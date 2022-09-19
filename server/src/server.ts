import express from "express";
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinute } from "./utils/convert-hour-string-to-minute";
import { convertMinutesNumberToHourString } from "./utils/convert-minutes-number-to-hour-string";

const app = express();

app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get('/games', async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });


  return res.json(games);
});

app.post('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id;

  const {
    name,
    yearsPlaying,
    discord,
    weekDays,
    hourStart,
    hourEnd,
    useVoiceChannel,
  } = req.body;

  const ad = await prisma.ad.create({
    data: {
      name,
      gameId,
      yearsPlaying,
      discord,
      weekDays: weekDays.join(','),
      hourStart: convertHourStringToMinute(hourStart),
      hourEnd: convertHourStringToMinute(hourEnd),
      useVoiceChannel,
    }
  });

  return res.status(201).json(ad);
});

app.get('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      gameId: true,
      weekDays: true,
      useVoiceChannel: true,
      hourStart: true,
      hourEnd: true,
    },

    where: { gameId },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(ads.map(ad => (
    {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesNumberToHourString(ad.hourStart),
      hourEnd: convertMinutesNumberToHourString(ad.hourEnd),
    }
  )));
})

app.get('/ads/:id/discord', async (req, res) => {
  const adId = req.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    select: { discord: true },
    where: { id: adId },
  });

  return res.json({
    discord: ad.discord,
  });
})

app.listen(3333)