import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiHide } from "react-icons/bi";
import { FaPause, FaPlay } from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { numberWithCommas } from "../helper";
import LastBlocksContext from "./LastBlocksContext";
import { TxTableSkeleton } from "./SkeletonLoader";
import TxItem from "./TxItem";
import EmptyTablePlaceholder from "./EmptyTablePlaceholder";

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

  // Memoize transaction rows to avoid recalculating on every render
  const txRows = useMemo(() => {
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

    return rows.slice(0, props.lines);
  }, [tempBlocks, ignoreCoinbaseTx, props.lines]);

  return (
    <div className="block-overview mb-4">
      <div className="d-flex flex-row align-items-center justify-content-between w-100 mb-3">
        <h4 className="block-overview-header mb-0 pb-0 d-flex align-items-center gap-2">
          <span className="position-relative d-inline-flex align-items-center justify-content-center">
            <span
              className="rounded-circle d-inline-block"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: keepUpdating ? '#14B8A6' : '#cb9931'
              }}
            />
            {keepUpdating && (
              <span
                className="position-absolute rounded-circle"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#14B8A6',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            )}
          </span>
          Latest transactions
        </h4>
        <div className="d-flex align-items-center gap-2">
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
                className={`hide-button ${ignoreCoinbaseTx && "hide-button-active"}`}
                onClick={toggleCoinbaseTransactions}
              />
            </span>
          </OverlayTrigger>
        </div>
      </div>
      {tempBlocks.length === 0 ? (
        <TxTableSkeleton lines={props.lines} />
      ) : (
        <div className="block-overview-content">
          {/* Table Header */}
          <div className="tx-table-header d-flex align-items-center gap-3 px-3 py-2 mb-2">
            <div style={{ width: '120px', flexShrink: 0 }}>
              <span className="text-slate-400 text-xs font-semibold">ID</span>
            </div>
            <div style={{ width: '200px', flexShrink: 0, textAlign: 'right' }}>
              <span className="text-slate-400 text-xs font-semibold">AMOUNT</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="text-slate-400 text-xs font-semibold">RECIPIENT</span>
            </div>
          </div>

          {/* TX Items or Empty State */}
          {txRows.length === 0 ? (
            <EmptyTablePlaceholder message={ignoreCoinbaseTx ? "No non-coinbase transactions available" : "No transactions available"} />
          ) : (
            txRows.map((x) => (
              <TxItem
                key={x.address + x.txId + x.outputIndex}
                txId={x.txId}
                amount={x.amount}
                address={x.address}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(TxOverview);
