import puppeteer from 'puppeteer'
import BigNumber from 'bignumber.js'
import userAgent from 'user-agents'

const members = [
  "BIII",
  "NV",
  "TRAINEE",
  "CGM48"
];

const getVote = (index) => {
  return `body > div.layout-container > main > section > div.card > div.card-body > div:nth-child(11) > span > div:nth-child(${2+(3*(index+1))})`;
}

export default async function handler(req, res) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString())
  await page.goto('https://scan.tokenx.finance/address/0x311895bF3c1bF9C09e6F855dA661797B09331cB7/read-contract');
  await page.waitForSelector(getVote(1))

  const ranked = []
  const fractor = new BigNumber("1000000000000000000");

  for (let index = 0; index < members.length; index++) {
    const amount = await page.$(getVote(index))
    let value = await page.evaluate(el => el.textContent, amount)
    value = value.replace("(uint256) :", "");
    value = new BigNumber(value)
    ranked.push({
      name: members[index],
      vote: value.dividedBy(fractor).toFixed(10)
    })
  }

  ranked.sort((a, b) => b.vote - a.vote)

  await browser.close()

  return res.status(200).json({
    updatedAt: new Date(),
    ranked
  })
}
