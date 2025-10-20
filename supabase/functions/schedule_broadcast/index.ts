export default async function main(req: Request): Promise<Response> {
  console.log("[schedule_broadcast] triggered");
  return new Response("ok");
}
