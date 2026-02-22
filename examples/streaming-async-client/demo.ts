import { streamingClient } from "./clients";
import { PORT } from "./constants";

const client = streamingClient(`0.0.0.0:${PORT}`);

async function main() {
  const unary = await client.echo({ message: "hello" });
  console.log("unary", unary);

  const serverStream = client.countdown({ from: 5 });
  serverStream.on("data", (chunk) => {
    console.log("countdown stream", chunk);
  });
  await new Promise<void>((resolve, reject) => {
    serverStream.on("end", resolve);
    serverStream.on("error", reject);
  });

  const collectedCountdown = await client.countdown({ from: 3 }).promise();
  console.log("countdown collected", collectedCountdown);

  const sumStream = client.sum();
  await sumStream.writeAll([{ value: 10 }, { value: 20 }, { value: 30 }]);
  const sum = await sumStream.promise();
  console.log("client stream sum", sum);

  const chatStream = client.chat();
  const repliesPromise = chatStream.promise();
  chatStream.on("data", (chunk) => {
    console.log("bidi stream", chunk);
  });
  await chatStream.writeAll([
    { message: "first" },
    { message: "second" },
    { message: "third" },
  ]);
  const collectedReplies = await repliesPromise;
  console.log("bidi collected", collectedReplies);
}

main().catch((error) => {
  console.error("demo failed", error);
  process.exit(1);
});
