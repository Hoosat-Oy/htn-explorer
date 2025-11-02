import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Button, Col, Container, Form, Row, Spinner, OverlayTrigger, Tooltip as BSTooltip } from "react-bootstrap";
import { BiGhost } from "react-icons/bi";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import Toggle from "react-toggle";
import usePrevious, { numberWithCommas } from "../helper";
import {
  getAddressBalance,
  getAddressTxCount,
  getAddressUtxos,
  getBlock,
  getBlockdagInfo,
  getTransactions,
  getTransactionsFromAddress,
} from "../htn-api-client.js";
import BlueScoreContext from "./BlueScoreContext";
import PriceContext from "./PriceContext.js";
import UtxoPagination from "./UtxoPagination.js";

import QRCodeStyling from "qr-code-styling";
import { TransactionListSkeleton, UtxoListSkeleton } from "./SkeletonLoader";
import { BiCopy } from "react-icons/bi";
import { FaQrcode, FaCheck, FaDownload } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import TransactionItem from "./TransactionItem";
import UtxoItem from "./UtxoItem";
import { motion, AnimatePresence } from "framer-motion";

const AddressInfoPage = () => {
  const { addr } = useParams();
  return <AddressInfo key={addr} />;
};

const AddressInfo = () => {
  const { addr } = useParams();
  const ref = useRef(null);

  const [buttonText, setButtonText] = useState("Download Transactions CSV");
  const [isDownloading, setIsDownloading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const [addressBalance, setAddressBalance] = useState();
  const { blueScore } = useContext(BlueScoreContext);
  const [search, setSearch] = useSearchParams();

  const [view, setView] = useState("transactions");
  const [showQr, setShowQr] = useState(false);

  const [detailedView, setDetailedView] = useState(localStorage.getItem("detailedView") === "true");

  const [utxos, setUtxos] = useState([]);
  const [loadingUtxos, setLoadingUtxos] = useState(true);

  const [txs, setTxs] = useState([]);
  const [txsInpCache, setTxsInpCache] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [txCount, setTxCount] = useState(null);
  const [pageError, setPageError] = useState(false);

  const [errorLoadingUtxos, setErrorLoadingUtxos] = useState(false);
  const [active, setActive] = useState(1);
  const [activeTx, setActiveTx] = useState((search.get("page") && parseInt(search.get("page"))) || 1);
  const prevActiveTx = usePrevious(activeTx);

  const [currentEpochTime, setCurrentEpochTime] = useState(0);
  const [currentDaaScore, setCurrentDaaScore] = useState(0);

  const { price } = useContext(PriceContext);

  const goToPage = (e) => {
    try {
      const pageNo = e.target.pageNo.value && parseInt(e.target.pageNo.value);

      if (!!pageNo && pageNo >= 1 && pageNo <= Math.ceil(txCount / 20)) {
        setActiveTx(pageNo);
        setPageError(false);
      } else {
        setPageError(true);
      }
    } catch {
      setPageError(true);
    }

    e.preventDefault();
  };

  const getAddrFromOutputs = (outputs, index) => {
    if (outputs[index] && outputs[index].index === index) {
      return outputs[index].script_public_key_address;
    } else {
      if (outputs && outputs.length > 0) {
        for (let i = 0; i < outputs.length; i++) {
          if (outputs[i].index === index) {
            return outputs[i].script_public_key_address;
          }
        }
      }
    }
  };

  const getAmountFromOutputs = (outputs, index) => {
    if (outputs[index] && outputs[index].index === index) {
      return outputs[index].amount / 100000000;
    } else {
      if (outputs && outputs.length > 0) {
        for (let i = 0; i < outputs.length; i++) {
          if (outputs[i].index === index) {
            return outputs[i].amount / 100000000;
          }
        }
      }
    }
  };

  const calculationFailed = (balance) => {
    if (balance === "0") {
      return "Calculation failed";
    }
    return balance;
  };

  const getAmount = (outputs, inputs) => {
    let balance = 0;
    for (let i = 0; i < outputs.length; i++) {
      if (outputs[i].script_public_key_address === addr) {
        balance += outputs[i].amount / 100000000;
      }
    }
    if (inputs && inputs.length > 0) {
      for (let j = 0; j < inputs.length; j++) {
        const cachedOutputs = txsInpCache[inputs[j].previous_outpoint_hash]?.outputs;
        if (cachedOutputs !== undefined && cachedOutputs.length > 0) {
          if (getAddrFromOutputs(cachedOutputs, inputs[j].previous_outpoint_index) === addr) {
            let amount = getAmountFromOutputs(cachedOutputs, inputs[j].previous_outpoint_index);
            balance -= amount;
          }
        }
      }
    }
    return balance;
  };

  useEffect(() => {
    getAddressBalance(addr).then((res) => {
      setAddressBalance(res);
    });

    getBlockdagInfo().then((blockdag) => {
      getBlock(blockdag.tipHashes[0]).then((block) => {
        setCurrentEpochTime(Math.round(parseInt(block.header.timestamp) / 1000));
        setCurrentDaaScore(parseInt(block.header.daaScore));
      });
    });
  }, [addr]);

  useEffect(() => {
    if (showQr && ref.current) {
      ref.current.innerHTML = '';

      const qrCode = new QRCodeStyling({
        data: addr,
        width: 300,
        height: 300,
        type: "svg",
        dotsOptions: {
          color: "#14B8A6",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          color: "#14B8A6",
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: "#14B8A6",
          type: "dot",
        },
      });

      qrCode.append(ref.current);
    }
  }, [showQr, addr]);

  useEffect(() => {
    localStorage.setItem("detailedView", detailedView);
  }, [detailedView]);

  useEffect(() => {
    setErrorLoadingUtxos(false);
    // setLoadingUtxos(true);
  }, [addressBalance]);

  const handleViewSwitch = (newView) => {
    setView(newView);
  };

  function removeDuplicates(arr) {
    return Array.from(new Set(arr));
  }

  const loadTransactionsToShow = useCallback((addr, limit, offset) => {
    setLoadingTxs(true);
    getTransactionsFromAddress(addr, limit, offset)
      .then((res) => {
        setTxs(res);
        if (res.length === 0) {
          // page was too high. Set page 1
          setActiveTx(1);
          setLoadingTxs(false);
          return;
        }
        setLoadingTxs(false);

        getTransactions(
          removeDuplicates(
            res
              .map((item) => item.inputs)
              .flatMap((x) => x)
              .map((x) => x.previous_outpoint_hash)
          ).slice(-1000)
        ).then((txs) => {
          var txInpObj = {};
          txs.forEach((x) => (txInpObj[x.transaction_id] = x));
          setTxsInpCache(txInpObj);
        });
      })
      .catch((ex) => {
        setLoadingTxs(false);
      });
  }, []);

  useEffect(() => {
    setSearch({ page: activeTx }, { replace: true });
    window.scrollTo(0, 0);

    if (view === "transactions") {
      setLoadingTxs(true);
      loadTransactionsToShow(addr, 20, (activeTx - 1) * 20);

      // Only fetch count on initial load or when address changes
      if (prevActiveTx === undefined) {
        getAddressTxCount(addr).then((totalCount) => {
          setTxCount(totalCount);
        });
      }

      // Load UTXOs only on initial load
      if (prevActiveTx === undefined) {
        getAddressUtxos(addr).then((res) => {
          setLoadingUtxos(false);
          setUtxos(res);
        });
      }
    }
  }, [view, activeTx, addr, loadTransactionsToShow, prevActiveTx, setSearch]);

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const downloadTransactionsAsCSV = async () => {
    setButtonText("Fetching Transactions...");
    setIsDownloading(true);

    const convertToCSV = (addr, transactions) => {
      const headers = [
        "Transaction ID",
        "Block Time",
        "Input Address",
        "Input Amount",
        "Output Address",
        "Output Amount",
      ];
      let csvRows = [headers.join(",")];
      transactions.forEach((tx) => {
        tx.outputs.forEach((output) => {
          if (tx.inputs !== null) {
            tx.inputs.forEach((input) => {
              if (input.previous_outpoint_address === addr || output.script_public_key_address === addr) {
                csvRows.push(
                  [
                    tx.transaction_id,
                    new Date(tx.block_time).toISOString(),
                    input.previous_outpoint_address,
                    input.previous_outpoint_amount / 100000000,
                    output.script_public_key_address,
                    output.amount / 100000000,
                  ].join(",")
                );
              }
            });
          } else {
            if (output.script_public_key_address === addr) {
              csvRows.push([
                tx.transaction_id, 
                new Date(tx.block_time).toISOString(),
                "coinbase",
                "coinbase",
                output.script_public_key_address,
                output.amount / 100000000,
              ].join(", "));
            }
          }
        });
      });
      return csvRows.join("\n");
    };

    const downloadCSV = (csvContent, filename) => {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const apiUrl = `https://api.network.hoosat.fi/addresses/${addr}/full-transactions/paged`;
    let page = 1;
    let transactions = [];

    try {
      while (true) {
        setButtonText(`Fetching Transactions: ${page * 50} tx`);
        const response = await fetch(`${apiUrl}?page=${page}&items_per_page=50&resolve_previous_outpoints=light`);
        if (response.status === 200) {
          const data = await response.json();
          if (data.length <= 0) break;
          transactions = transactions.concat(data);
          page++;
          sleep(500);
        } else {
          break;
        }
      }

      if (transactions.length === 0) {
        setButtonText("No Transactions Found");
        setTimeout(() => setButtonText("Download Transactions CSV"), 2000);
        setIsDownloading(false);
        return;
      }

      setButtonText("Generating CSV...");
      const csvData = convertToCSV(addr, transactions);
      downloadCSV(csvData, `${addr}-transactions.csv`);

      setButtonText("Download Complete ✅");
      setTimeout(() => setButtonText("Download Transactions CSV"), 3000);
    } catch (error) {
      setButtonText("Error! Try Again");
      setTimeout(() => setButtonText("Download Transactions CSV"), 3000);
    }

    setIsDownloading(false);
  };

  return (
    <div className="addressinfo-page">
      <Container className="webpage" fluid style={{ paddingTop: '2rem' }}>
        <Row>
          <Col xs={12}>
            <h2 className="text-white mb-4" style={{ fontSize: '2rem', fontWeight: '700' }}>Address Overview</h2>
          </Col>
        </Row>

        {/* Address Card */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 h-full w-full">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="flex-grow-1 d-flex align-items-center gap-2" style={{ minWidth: '0' }}>
                    <div className="utxo-value-mono d-flex align-items-center gap-2" style={{ fontSize: '0.95rem', wordBreak: 'break-all' }}>
                      <span><span className="addressinfo-color">hoosat:</span>{addr.substring(7, addr.length - 8)}<span className="addressinfo-color">{addr.substring(addr.length - 8)}</span></span>
                      <OverlayTrigger
                        placement="top"
                        overlay={<BSTooltip id="copy-addr-tooltip">{justCopied ? 'Copied!' : 'Copy Address'}</BSTooltip>}
                      >
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(addr);
                            setJustCopied(true);
                            setTimeout(() => {
                              setJustCopied(false);
                            }, 2000);
                          }}
                          className="bg-transparent border-0 text-slate-400 hover:text-hoosat-teal transition-colors p-1"
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                        >
                          {justCopied ? <FaCheck size={14} /> : <BiCopy size={16} />}
                        </button>
                      </OverlayTrigger>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <OverlayTrigger
                      placement="top"
                      overlay={<BSTooltip id="qr-tooltip">{showQr ? 'Hide QR Code' : 'Show QR Code'}</BSTooltip>}
                    >
                      <Button
                        onClick={() => setShowQr(!showQr)}
                        style={{
                          backgroundColor: showQr ? '#0d9488' : '#14B8A6',
                          border: 'none',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '42px',
                          height: '38px'
                        }}
                      >
                        <FaQrcode />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<BSTooltip id="download-csv-tooltip">{isDownloading ? buttonText : 'Download Transactions CSV'}</BSTooltip>}
                    >
                      <Button
                        id="transactions-csv-download"
                        onClick={downloadTransactionsAsCSV}
                        disabled={isDownloading}
                        style={{
                          backgroundColor: isDownloading ? '#0d9488' : '#14B8A6',
                          border: 'none',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '42px',
                          height: '38px',
                          opacity: isDownloading ? 0.8 : 1
                        }}
                      >
                        {isDownloading ? (
                          <Spinner animation="border" size="sm" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                        ) : (
                          <FaDownload />
                        )}
                      </Button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>

              {/* Stats Cards inside address card */}
              <Row className="g-3 mt-3 pt-3" style={{ borderTop: '1px solid #334155' }}>
          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Balance (HTN)</div>
              {addressBalance !== undefined ? (
                <div className="text-hoosat-teal" style={{ fontSize: '1.15rem', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {numberWithCommas(addressBalance / 100000000)}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
            </div>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Value (USD)</div>
              {addressBalance !== undefined ? (
                <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  $ {numberWithCommas(((addressBalance / 100000000) * price).toFixed(2))}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
            </div>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>UTXOs</div>
              {!loadingUtxos ? (
                <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {numberWithCommas(utxos.length)}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
              {errorLoadingUtxos && <BiGhost className="error-icon" />}
            </div>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Transactions</div>
              {txCount !== null ? (
                <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {numberWithCommas(txCount)}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
            </div>
          </Col>
        </Row>
            </div>
          </Col>
        </Row>
      </Container>

      <Container className="webpage mt-4" fluid>
        <Row>
          <Col className="d-flex flex-row justify-content-center">
            <div className="d-flex gap-2 p-1 rounded" style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid #334155' }}>
              <button
                onClick={() => handleViewSwitch('transactions')}
                className={`px-4 py-2 rounded transition-all ${
                  view === 'transactions'
                    ? 'bg-hoosat-teal text-white'
                    : 'bg-transparent text-slate-400 hover:text-hoosat-teal'
                }`}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: view === 'transactions' ? '600' : '400',
                  backgroundColor: view === 'transactions' ? '#14B8A6' : 'transparent',
                  color: view === 'transactions' ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (view !== 'transactions') {
                    e.target.style.color = '#14B8A6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'transactions') {
                    e.target.style.color = '#94a3b8';
                  }
                }}
              >
                Transaction History
              </button>
              <button
                onClick={() => handleViewSwitch('utxos')}
                className={`px-4 py-2 rounded transition-all ${
                  view === 'utxos'
                    ? 'bg-hoosat-teal text-white'
                    : 'bg-transparent text-slate-400 hover:text-hoosat-teal'
                }`}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: view === 'utxos' ? '600' : '400',
                  backgroundColor: view === 'utxos' ? '#14B8A6' : 'transparent',
                  color: view === 'utxos' ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (view !== 'utxos') {
                    e.target.style.color = '#14B8A6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'utxos') {
                    e.target.style.color = '#94a3b8';
                  }
                }}
              >
                UTXOs
              </button>
            </div>
          </Col>
        </Row>
      </Container>

      {view === "transactions" && (
        <Container className="webpage mt-4" fluid>
          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 h-full w-full">
            <Row className="mb-3 pb-3 align-items-center" style={{ borderBottom: '1px solid #334155' }}>
              <Col xs={12} md={6} className="d-flex flex-row align-items-center mb-3 mb-md-0">
                <h4 className="mb-0 me-3" style={{ color: '#14B8A6', fontWeight: '600' }}>Transaction History</h4>
                <div className="d-flex flex-row align-items-center">
                  <Toggle
                    checked={detailedView}
                    icons={false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDetailedView(checked);
                      localStorage.setItem("detailedView", checked.toString());
                    }}
                    className="hoosat-toggle"
                  />
                  <span className="text-slate-400 ms-2" style={{ fontSize: '0.875rem' }}>Show details</span>
                </div>
              </Col>
              <Col xs={12} md={6} className="d-flex flex-row justify-content-md-end justify-content-center">
                {txCount !== null ? (
                  <UtxoPagination active={activeTx} total={Math.ceil(txCount / 20)} setActive={setActiveTx} />
                ) : (
                  <div className="skeleton skeleton-text" style={{ width: '200px', height: '36px', borderRadius: '0.5rem' }} />
                )}
              </Col>
            </Row>
          {txCount === 0 && (
            <Row className="utxo-value mt-3">
              <Col xs={12}>No transactions to show.</Col>
            </Row>
          )}
          {!loadingTxs ? (
            <>
              {txs.map((tx) => (
                <TransactionItem
                  key={tx.transaction_id}
                  transaction={tx}
                  addr={addr}
                  price={price}
                  blueScore={blueScore}
                  txsInpCache={txsInpCache}
                  getAmount={getAmount}
                  getAddrFromOutputs={getAddrFromOutputs}
                  getAmountFromOutputs={getAmountFromOutputs}
                  calculationFailed={calculationFailed}
                  detailedView={detailedView}
                />
              ))}
              <Row>
                <Col xs={12} sm={6} className="d-flex flex-row justify-content-center mb-3 mb-sm-0">
                  <div className="me-auto" style={{ height: "2.4rem" }}>
                    <Form onSubmit={goToPage} className="d-flex flex-row">
                      <Form.Control
                        type="text"
                        placeholder="Page"
                        name="pageNo"
                        style={{
                          width: "4rem",
                          border: `${pageError ? "5px solid red" : ""}`,
                        }}
                      />
                      <Button type="submit" className="ms-2 me-auto">
                        Go
                      </Button>
                    </Form>
                  </div>
                </Col>
                <Col xs={12} sm={6} className="d-flex flex-row justify-content-end">
                  <UtxoPagination
                    className="ms-auto"
                    active={activeTx}
                    total={Math.ceil(txCount / 20)}
                    setActive={setActiveTx}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <TransactionListSkeleton lines={10} />
          )}
          </div>
        </Container>
      )}
      {view === "utxos" && (
        <Container className="webpage mt-4" fluid>
          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 h-full w-full">
            <Row className="mb-3 pb-3 align-items-center" style={{ borderBottom: '1px solid #334155' }}>
              <Col xs={12} md={6} className="d-flex flex-row align-items-center mb-3 mb-md-0">
                <h4 className="mb-0" style={{ color: '#14B8A6', fontWeight: '600' }}>UTXOs</h4>
              </Col>
              {utxos.length > 10 && (
                <Col xs={12} md={6} className="d-flex flex-row justify-content-md-end justify-content-center">
                  <UtxoPagination active={active} total={Math.ceil(utxos.length / 10)} setActive={setActive} />
                </Col>
              )}
            </Row>
            {errorLoadingUtxos && <BiGhost className="error-icon" />}
          {!loadingUtxos ? (
            utxos
              .sort((a, b) => b.utxoEntry.blockDaaScore - a.utxoEntry.blockDaaScore)
              .slice((active - 1) * 10, (active - 1) * 10 + 10)
              .map((utxo) => (
                <UtxoItem
                  key={`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`}
                  utxo={utxo}
                  price={price}
                  currentEpochTime={currentEpochTime}
                  currentDaaScore={currentDaaScore}
                />
              ))
          ) : (
            <UtxoListSkeleton lines={10} />
          )}
          </div>
        </Container>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQr && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center"
              onClick={() => setShowQr(false)}
            >
              {/* QR Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-hoosat-slate/95 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-gradient">Address QR Code</h3>
                    <button
                      onClick={() => setShowQr(false)}
                      className="text-slate-300 hover:text-hoosat-teal transition-colors duration-200 bg-transparent border-0 p-0"
                      style={{ background: 'transparent', border: 'none', outline: 'none', padding: 0 }}
                    >
                      <HiX size={24} />
                    </button>
                  </div>

                  {/* QR Code Display */}
                  <div className="p-6 flex flex-col items-center">
                    <div className="qr-code bg-white p-4 rounded-lg" ref={ref} />
                    <div className="mt-4 text-center">
                      <p className="text-slate-400 text-sm mb-2">Scan to send HTN to this address</p>
                      <div className="bg-hoosat-dark/50 p-3 rounded-lg border border-slate-700">
                        <p className="text-slate-300 font-mono text-xs break-all">
                          {addr}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressInfoPage;
