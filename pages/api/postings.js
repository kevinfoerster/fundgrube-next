// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import fetch from "node-fetch"

const handler = async (req, res) => {
  console.log(req.query);
  const searchParams = new URLSearchParams(req.query);

  const response = await fetch(`https://www.mediamarkt.de/de/data/fundgrube/api/postings?${searchParams.toString()}`);
  const data = await response.json();
  res.status(200).json(data)
}
export default handler