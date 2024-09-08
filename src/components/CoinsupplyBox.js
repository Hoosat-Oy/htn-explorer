import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useEffect, useState, useCallback } from "react";
import { numberWithCommas } from "../helper";
import { getCoinSupply, getHalving, getBlockdagInfo } from "../htn-api-client";

const CBox = () => {
  const [circCoins, setCircCoins] = useState("-");
  const [blockReward, setBlockReward] = useState("-");
  const [halvingDate, setHalvingDate] = useState("-");
  const [halvingAmount, setHalvingAmount] = useState("-");

  const initBox = useCallback(() => {
    const fetchCoinSupply = async () => {
      const coinSupplyResp = await getCoinSupply();
      const dag_info = await getBlockdagInfo();
      getBlockReward(dag_info);

      getHalving().then((d) => {
        setHalvingDate(moment(d.nextHalvingTimestamp * 1000).format("YYYY-MM-DD HH:mm"));
        setHalvingAmount(d.nextHalvingAmount.toFixed(2));
      });

      setCircCoins(Math.round(coinSupplyResp.circulatingSupply / 100000000));
    };
    fetchCoinSupply();
  }, []);

  useEffect(() => {
    initBox();

    const updateCircCoins = setInterval(async () => {
      const coinSupplyResp = await getCoinSupply();
      setCircCoins(Math.round(coinSupplyResp.circulatingSupply / 100000000));
    }, 10000);

    return async () => {
      clearInterval(updateCircCoins);
    };
  }, [initBox]);

  async function getBlockReward(dag_info) {
    await fetch(`${process.env.REACT_APP_API}/info/blockreward`)
      .then((response) => response.json())
      .then((d) => {
        if (dag_info.virtualDaaScore > 17500000) {
          setBlockReward((d.blockreward * 0.95).toFixed(2));
        } else {
          setBlockReward(d.blockreward.toFixed(2));
        }
        
      })
      .catch((err) => console.log("Error", err));
  }

  useEffect(() => {
    document.getElementById("coins").animate(
      [
        // keyframes
        { opacity: "1" },
        { opacity: "0.6" },
        { opacity: "1" },
      ],
      {
        // timing options
        duration: 300,
      }
    );
  }, [circCoins]);

  return (
    <>
      <div className="cardBox mx-0">
        <table style={{ fontSize: "1rem" }}>
          <tbody>
            <tr>
              <td colSpan="2" className="text-center" style={{ fontSize: "4rem" }}>
                <FontAwesomeIcon icon={faCoins} />
                <div id="light1" className="cardLight" />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="text-center">
                <h3>Coin supply</h3>
              </td>
            </tr>
            <tr>
              <td className="cardBoxElement align-top">Total</td>
              <td className="">
                <div id="coins">{numberWithCommas(circCoins)} HTN</div>
              </td>
            </tr>
            <tr>
              <td className="cardBoxElement align-top">
                Max <span className="approx">(approx.)</span>
              </td>
              <td className="pt-1">17,100,000,000 HTN</td>
            </tr>
            <tr>
              <td className="cardBoxElement align-top">Mined</td>
              <td className="pt-1">{((circCoins / 17100000000) * 100).toFixed(2)} %</td>
            </tr>
            <tr>
              <td className="cardBoxElement align-top">Block reward</td>
              <td className="pt-1">{blockReward} HTN</td>
            </tr>
            <tr>
              <td className="cardBoxElement align-top">
                Reward reduction
                {/* <OverlayTrigger overlay={<Tooltip id="halvinginfo">Here is some information about the chromatic halving..</Tooltip>}>
                                <span>
                                <FaInfoCircle />
                                </span>
                            </OverlayTrigger> */}
              </td>
              <td className="pt-1">
                {halvingDate}
                <br />
                <div className="text-end w-100 pe-3 pt-1" style={{ fontSize: "small" }}>
                  to {halvingAmount} HTN
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CBox;
