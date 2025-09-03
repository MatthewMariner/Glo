const express = require('express');
const { Server } = require('socket.io');
const { OpenAIStream } = require('./chatStream.js');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;

const app = express();
const server = require('http').createServer(app);

const io = new Server(server, {
  cors: {
    // origin: process.env.NEXT_PUBLIC_APP_URL,
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('message', async (message) => {
    const { messages, userId, conversationId, userPromptId } = message;

    console.log(`Received @ server.js: ${message}`);

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('No messages provided');
      return;
    }

    const userInput = messages[messages.length - 1].content;

    if (userId) {
      const loggedInUserId = userId;
      const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;
      const apiKeyFinal = process.env.NEXT_PRIVATE_OPENAI_API_KEY;
      const model = process.env.NEXT_PRIVATE_OPENAI_MODEL;

      console.log('settings', userId, BASE_URL, apiKeyFinal, model);

      if (!apiKeyFinal || !model || !loggedInUserId) {
        console.error('API|MODEL|USER key not found', message);
        return;
      }

      const promptResponse = await fetch(
        `${BASE_URL}/api/prisma/getDefaultPrompt`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const promptResponseData = await promptResponse.json();
      console.log('promptresponse', promptResponse);

      if (!promptResponse.ok) {
        try {
          const errtxt = await promptResponse.text();
          console.error(errtxt);
        } catch (err) {
          console.error(err);
        }

        // throw new Error('Failed to fetch default prompt'); // this is not handled anywhere
        console.error('Failed to fetch default prompt');
      }

      const { content: systemPromptContent, id: systemPromptId } =
        promptResponseData;

      const formattedMessages = [
        { role: 'system', content: systemPromptContent },
        ...messages,
      ];

      await OpenAIStream(
        socket,
        formattedMessages,
        model,
        apiKeyFinal,
        loggedInUserId,
        userInput,
        conversationId,
        systemPromptId,
        userPromptId,
      );
    } else {
      console.error('Error - no userId');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client has disconnected');
  });
});

server.listen(port, () => {
  console.log(`> Ready on PORT ${port}`);
});


// Catch-alls
//
// catch uncaught (sync) exceptions throughout the entire API
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message, err);
  console.log("-UNHANDLED EXCEPTION CAUGHT-");

  // server must die now, because node is in an unclean state
  console.log("-MUST DIE, sorry-");
  process.exit(1);
});
// test with
// console.log(x); // x is undefined

// catch unhandled promise rejections through the entire API
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message, err);
  console.log("-UNHANDLED REJECTION CAUGHT-");
  // only enable the below if we have something in place that restarts server on death
  // expressServer.close(() => {
  //   process.exit(1); // exit 
  // });
});