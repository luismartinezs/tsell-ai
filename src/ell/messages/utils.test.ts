import { describe, it, expect } from 'vitest';
import { contentBlockToLlmContent, llmResponseToMessage } from './utils';

describe('contentBlockToLlmContent', () => {
  it('should convert a single content block to LLM format', () => {
    const actual = contentBlockToLlmContent([
      {
        text: "You are a helpful assistant."
      }
    ]);
    const expected = 'You are a helpful assistant.'
    expect(actual).toEqual(expected)
  });

  it('should convert a single content block to LLM format', () => {
    const actual = contentBlockToLlmContent([
      {
        text: "You are a helpful assistant."
      },
      {
        text: "You are a mindful assistant."
      }
    ]);
    const expected = [
      {
        type: 'text',
        text: "You are a helpful assistant."
      },
      {
        type: 'text',
        text: "You are a mindful assistant."
      }
    ]
    expect(actual).toEqual(expected)
  });
});

describe('llmResponseToMessage', () => {
  it('should convert a single LLM message to a message', () => {
    const actual = llmResponseToMessage({
      "id": "chatcmpl-A9woaobmD2PPhIOTU59IW8I0egDlH",
      "object": "chat.completion",
      "created": 1726934400,
      "model": "gpt-4o-mini-2024-07-18",
      "choices": [
        {
          "message": {
            "role": "assistant",
            "content": "{\"title\":\"Star Wars\",\"rating\":9.0,\"summary\":\"Set in a galaxy far, far away, 'Star Wars' follows the epic battle between the Rebel Alliance and the oppressive Galactic Empire. The film introduces iconic characters such as Luke Skywalker, Princess Leia, and Darth Vader, and explores themes of heroism, friendship, and the fight against tyranny. With groundbreaking special effects, memorable music, and a timeless story, 'Star Wars' has become a cultural phenomenon, influencing countless subsequent films and expanding into a vast franchise.\"}",
            "refusal": null,
            "tool_calls": [],
            "parsed": {
              "title": "Star Wars",
              "rating": 9,
              "summary": "Set in a galaxy far, far away, 'Star Wars' follows the epic battle between the Rebel Alliance and the oppressive Galactic Empire. The film introduces iconic characters such as Luke Skywalker, Princess Leia, and Darth Vader, and explores themes of heroism, friendship, and the fight against tyranny. With groundbreaking special effects, memorable music, and a timeless story, 'Star Wars' has become a cultural phenomenon, influencing countless subsequent films and expanding into a vast franchise."
            }
          },
        }
      ],
      "usage": {
        "prompt_tokens": 129,
        "completion_tokens": 109,
        "total_tokens": 238,
        "completion_tokens_details": {
          "reasoning_tokens": 0
        }
      },
      "system_fingerprint": "fp_1bb46167f9"
    }, []);
    const expected = [{
      "role": "assistant",
      "content": [{ "text": "{\"title\":\"Star Wars\",\"rating\":9.0,\"summary\":\"Set in a galaxy far, far away, 'Star Wars' follows the epic battle between the Rebel Alliance and the oppressive Galactic Empire. The film introduces iconic characters such as Luke Skywalker, Princess Leia, and Darth Vader, and explores themes of heroism, friendship, and the fight against tyranny. With groundbreaking special effects, memorable music, and a timeless story, 'Star Wars' has become a cultural phenomenon, influencing countless subsequent films and expanding into a vast franchise.\"}" }],
      text: '<parsed>',
      "parsed": {
        "title": "Star Wars",
        "rating": 9,
        "summary": "Set in a galaxy far, far away, 'Star Wars' follows the epic battle between the Rebel Alliance and the oppressive Galactic Empire. The film introduces iconic characters such as Luke Skywalker, Princess Leia, and Darth Vader, and explores themes of heroism, friendship, and the fight against tyranny. With groundbreaking special effects, memorable music, and a timeless story, 'Star Wars' has become a cultural phenomenon, influencing countless subsequent films and expanding into a vast franchise."
      },
      "tool_calls": null,
      "callToolsAndCollectAsMessage": null
    }]
    expect(actual).toEqual(expected)
  });

  it('should convert a multiple LLM messages to a message', () => {
    const actual = llmResponseToMessage({
      choices: [
        {
          "message": {
            "role": "assistant",
            "content": "Hello! How can I assist you today?",
            "refusal": null,
            "tool_calls": [],
            "parsed": null
          },
        },
        {
          "message": {
            "role": "assistant",
            "content": "Hello! How can I assist you today?",
            "refusal": null,
            "tool_calls": [],
            "parsed": null
          },
        },
      ]
    }, [])
    const expected = [
      {
        "role": "assistant",
        "content": [{ text: "Hello! How can I assist you today?" }],
        "text": "Hello! How can I assist you today?",
        "parsed": null,
        "tool_calls": null,
        "callToolsAndCollectAsMessage": null
      },
      {
        "role": "assistant",
        "content": [{ text: "Hello! How can I assist you today?" }],
        "text": "Hello! How can I assist you today?",
        "parsed": null,
        "tool_calls": null,
        "callToolsAndCollectAsMessage": null
      }
    ]
    expect(actual).toEqual(expected)
  });
});