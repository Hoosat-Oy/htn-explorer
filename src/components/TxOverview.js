import { useContext, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiHide } from "react-icons/bi";
import { FaPause, FaPlay } from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { numberWithCommas } from "../helper";
import LastBlocksContext from "./LastBlocksContext";

const TxOverview = (props) => {
  const [tempBlocks, setTempBlocks] = useState([]);
  const [keepUpdating, setKeepUpdating] = useState(true);
  const [ignoreCoinbaseTx, setIgnoreCoinbaseTx] = useState(false);

  const keepUpdatingRef = useRef();
  keepUpdatingRef.current = keepUpdating;

  const { blocks, isConnected } = useContext(LastBlocksContext);
  const navigate = useNavigate();

  const onClickRow = (e) => {
    navigate(`/txs/${e.target.closest("tr").getAttribute("txid")}`);
  };

  const onClickAddr = (e) => {
    navigate(`/addresses/${e.target.closest("tr").getAttribute("id")}`);
  };

  useEffect(() => {
    if (keepUpdatingRef.current) {
      setTempBlocks(blocks);
    }
  }, [blocks]);

  const toggleCoinbaseTransactions = () => {
    setIgnoreCoinbaseTx(!ignoreCoinbaseTx);
  };

  return (
    <div className="block-overview mb-4">
      <div className="d-flex flex-row w-100">
        {!keepUpdating ? (
          <FaPlay id="play-button" className="play-button" onClick={() => setKeepUpdating(true)} />
        ) : (
          <FaPause id="pause-button" className="play-button" onClick={() => setKeepUpdating(false)} />
        )}

        <OverlayTrigger
          overlay={<Tooltip id="tooltip-kgi">{ignoreCoinbaseTx ? "Show" : "Hide"} coinbase transactions</Tooltip>}
        >
          <span>
            <BiHide
              className={`mx-0 mt-3 hide-button ${ignoreCoinbaseTx && "hide-button-active"}`}
              onClick={toggleCoinbaseTransactions}
            />
          </span>
        </OverlayTrigger>
        <h4 className="block-overview-header text-center w-100 me-4">
          <RiMoneyDollarCircleFill className={isConnected && keepUpdating ? "rotate" : ""} size="1.7rem" /> LATEST
          TRANSACTIONS
        </h4>
      </div>
      <div className="block-overview-content">
        <table className={`styled-table w-100`}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Amount</th>
              <th width="100%">Recipient</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const seen = new Set();
              const rows = [];

              [...tempBlocks]
                .sort((a, b) => b.blueScore - a.blueScore)
                .forEach((block) => {
                  const txs = block.txs.slice(ignoreCoinbaseTx ? 1 : 0);
                  txs.forEach((tx) => {
                    tx.outputs.forEach(([address, amount], outputIndex) => {
                      const key = `${tx.txId}-${outputIndex}`;
                      if (!seen.has(key)) {
                        seen.add(key);
                        rows.push({
                          amount,
                          address,
                          txId: tx.txId,
                          outputIndex,
                        });
                      }
                    });
                  });
                });

              return rows.slice(0, props.lines).map((x) => (
                <tr id={x.address} txid={x.txId} key={x.address + x.txId + x.outputIndex}>
                  <td onClick={onClickRow}>{x.txId.slice(0, 10)}</td>
                  <td onClick={onClickRow} align="right">
                    {numberWithCommas(x.amount / 100000000)}&nbsp;HTN
                  </td>
                  <td className="hashh" onClick={onClickAddr}>
                    {x.address}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TxOverview;
