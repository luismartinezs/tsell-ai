import { describe, it, expect } from "vitest";
import { createMessage, coerceContentBlock, user, assistant, system } from ".";

describe('messages', () => {
  it('should create a message from a string', () => {
    const message = createMessage('user', 'Hello');
    expect(message.text).toEqual('Hello');
  })
  it('should create a message from an array of strings', () => {
    const message = createMessage('user', ['Hello', 'World']);
    expect(message.text).toEqual('Hello\nWorld');
  });

  it('should allow wrapping in coerceContentBlock', () => {
    const message = createMessage('user', coerceContentBlock({ text: "Hello" }));
    expect(message.text).toEqual('Hello');
  })

  it('should allow wrapping in array of coerceContentBlock', () => {
    const message = createMessage('user', [coerceContentBlock({ text: "Hello" }), coerceContentBlock({ text: "World" })]);
    expect(message.text).toEqual('Hello\nWorld');
  })

  it('should allow wrapping in user', () => {
    const message = user('Hello');
    expect(message.role).toEqual('user');
    expect(message.text).toEqual('Hello');
  })

  it('should allow wrapping in assistant', () => {
    const message = assistant('Hello');
    expect(message.role).toEqual('assistant');
    expect(message.text).toEqual('Hello');
  })

  it('should allow wrapping in system', () => {
    const message = system('Hello');
    expect(message.role).toEqual('system');
    expect(message.text).toEqual('Hello');
  })

  it('should ignore unknown content types', () => {
    const message = createMessage('user', ['Hello', null, 'World']);
    expect(message.text).toEqual('Hello\nWorld');
  })

  it('should handle parsed content', () => {
    const parsed = {
      value: 42
    }
    const message = createMessage('user', coerceContentBlock({
      parsed: parsed
    }));
    const expected = parsed
    expect(message.parsed).toEqual(expected);
  })

  it('should handle arrays of parsed content', () => {
    const parsed = {
      value: 42
    }
    const message = createMessage('user', [coerceContentBlock({
      parsed: parsed
    }), coerceContentBlock({
      parsed: parsed
    })]);
    const expected = [parsed, parsed]
    expect(message.parsed).toEqual(expected);
  })
});