import { useContext, useEffect, useState } from "react";
import { HiCurrencyDollar } from "react-icons/hi";
import { IoMdTrendingDown, IoMdTrendingUp } from "react-icons/io";
import { numberWithCommas } from "../helper";
import { getCoinSupply, getBlockdagInfo } from "../htn-api-client";
import PriceContext from "./PriceContext";

const BPS = 5;

const MarketDataBox = () => {
  const [circCoinsMData, setCircCoinsMData] = useState("-");
  const { price, marketData } = useContext(PriceContext);
  const [dailyYield, setDailyYield] = useState(0);

  const initBox = async () => {
    const coin_supply = await getCoinSupply();
    const dag_info = await getBlockdagInfo();
    setCircCoinsMData(Math.round(parseFloat(coin_supply.circulatingSupply) / 100000000));
    // daily yield = (your hashrate / network hashrate) * block reward * (86400 / blocks per second)
    const blockReward = await getBlockReward();
    if (dag_info.virtualDaaScore > 17500000) {
      setDailyYield((1 / ((dag_info.difficulty * 2) / 1000)) * (blockReward * 0.95) * (86400 / 1));
    } else {
      setDailyYield((1 / ((dag_info.difficulty * 2) / 1000)) * blockReward * (86400 / 1));
    }
  };

  async function getBlockReward() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/info/blockreward`);
      const data = await response.json();
      return data.blockreward;
    } catch (err) {
      console.log("Error", err);
      return null;
    }
  }

  useEffect(() => {
    initBox();
  }, []);

  return (
    <>
      <div className="cardBox mx-0">
        <table>
          <tbody>
            <tr>
              <td colSpan="2" className="text-center" style={{ fontSize: "3.8rem" }}>
                <HiCurrencyDollar style={{ transform: "translateY(-10px)" }} />
                <div id="light1" className="cardLight" />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="text-center">
                <h3>Market data</h3>
              </td>
            </tr>
            <tr>
              <td className="cardBoxElement">MCAP</td>
              <td className="pt-1">$ {(circCoinsMData * price).toFixed(2)} </td>
            </tr>
            <tr>
              <td className="cardBoxElement">Price</td>
              <td>$ {price} / HTN</td>
            </tr>
            <tr>
              <td style={{ fontSize: "small" }} className="cardBoxElement" align="right">
                1h %
              </td>
              <td style={{ fontSize: "small" }} className="utxo-value-mono">
                {marketData?.price_change_percentage_1h_in_currency?.usd > 0 ? (
                  <IoMdTrendingUp color="#398851" />
                ) : (
                  <IoMdTrendingDown color="#d63328" />
                )}
                {marketData?.price_change_percentage_1h_in_currency?.usd?.toFixed(1)} %<br />
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: "small" }} className="cardBoxElement" align="right">
                24h %
              </td>
              <td style={{ fontSize: "small" }} className="utxo-value-mono">
                {marketData?.price_change_percentage_24h > 0 ? (
                  <IoMdTrendingUp color="#398851" />
                ) : (
                  <IoMdTrendingDown color="#d63328" />
                )}
                {marketData?.price_change_percentage_24h?.toFixed(1)} %<br />
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: "small" }} className="cardBoxElement" align="right">
                7d %
              </td>
              <td style={{ fontSize: "small" }} className="utxo-value-mono">
                {marketData?.price_change_percentage_7d > 0 ? (
                  <IoMdTrendingUp color="#398851" />
                ) : (
                  <IoMdTrendingDown color="#d63328" />
                )}
                {marketData?.price_change_percentage_7d?.toFixed(1)} %<br />
              </td>
            </tr>
            <tr>
              <td className="cardBoxElement">Volume</td>
              <td className="pt-1">$ {numberWithCommas(marketData?.total_volume?.usd)}</td>
            </tr>
            <tr>
              <td className="cardBoxElement nowrap">Yield Kh</td>
              <td className="pt-1">{dailyYield.toFixed(2)} HTN</td>
            </tr>
            <tr>
              <td className="cardBoxElement nowrap">Revenue Kh</td>
              <td className="pt-1">$ {(dailyYield * price).toFixed(6)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MarketDataBox;
