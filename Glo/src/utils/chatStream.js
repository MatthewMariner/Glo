const { createParser } = require('eventsource-parser');

const OpenAIStream = async (
  ws,
  messages,
  model,
  key,
  userId,
  userInput,
  conversationId,
  systemPromptId,
  userPromptId,
) => {
  const systemPrompt = messages;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;
  const loggedInUserId = userId;

  console.log('sysPrompt is..');
  console.log(systemPrompt);

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || process.env.NEXT_PRIVATE_OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: systemPrompt,
      temperature: 0,
      stream: true,
    }),
  });

  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  let responseText = '';

  const onParse = async (event) => {
    if (event.type === 'event') {
      const data = event.data;

      if (data === '[DONE]') {
        const response = await fetch(`${BASE_URL}/api/prisma/createChatFlow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: loggedInUserId,
            userInput: userInput,
            aiResponse: responseText,
            conversationId: conversationId,
            systemPromptId: systemPromptId,
            userPromptId: userPromptId,
          }),
        });

        if (!response.ok) {
          console.error(await response.text());
        }

        const responseData = await response.json();

        const responseMessage = {
          responseText,
          conversationId: responseData.conversationId,
          isDone: true,
        };

        ws.send(JSON.stringify(responseMessage));

        return;
      }

      try {
        const json = JSON.parse(data);
        if (json.choices && json.choices[0] && json.choices[0].delta) {
          const text = json.choices[0].delta.content;
          if (text) {
            responseText += text;
            ws.send(responseText);
          }
        } else if (
          json.choices &&
          json.choices[0] &&
          json.choices[0].finish_reason
        ) {
          const reason = json.choices[0].finish_reason;
          if (reason === 'stop') {
          } else {
          }
        } else {
          console.log('Invalid data structure:', data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const parser = createParser(onParse);

  (async () => {
    for await (const chunk of res.body) {
      parser.feed(decoder.decode(chunk));
    }
  })();
};

module.exports = { OpenAIStream };
