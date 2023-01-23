import { json } from "@sveltejs/kit";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { toUtf8, fromUtf8 } from "@aws-sdk/util-utf8-node";

import { AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY } from "$env/static/private";

export async function POST({ cookies, locals, request }: any) {
  // console.log("cover-upload", { locals });
  // const session = await locals.getSession();
  // console.log({ session });
  const session = await locals.getSession();
  if (!session) {
    return { success: false };
  }

  const reqBody = await request.json();

  const { url } = reqBody;
  const { userId } = session;

  console.log({ url: reqBody.url });

  try {
    const client = new LambdaClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: AMAZON_ACCESS_KEY,
        secretAccessKey: AMAZON_SECRET_KEY
      }
    });
    const command = new InvokeCommand({
      FunctionName: "book-covers-v2-dev-uploadFromUrl",

      Payload: fromUtf8(JSON.stringify({ url, userId }))
    });
    const response = await client.send(command);

    if (response.Payload) {
      console.log("Payload response", toUtf8(response.Payload));
    } else {
      console.log("No response payload");
    }
  } catch (er) {
    console.log("Error invoking lambda", er);
  }

  return json({});
}
