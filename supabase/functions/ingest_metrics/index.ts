export default async function main(req: Request): Promise<Response> {
  console.log("[ingest_metrics] triggered");
  return new Response("ok");
}
