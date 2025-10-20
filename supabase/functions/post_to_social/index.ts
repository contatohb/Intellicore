export default async function main(req: Request): Promise<Response> {
  console.log("[post_to_social] triggered");
  return new Response("ok");
}
