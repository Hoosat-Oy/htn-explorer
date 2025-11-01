import moment from "moment";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Button, Col, Container, Form, Row, Spinner, OverlayTrigger, Tooltip as BSTooltip } from "react-bootstrap";
import { BiGhost } from "react-icons/bi";
import { useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import Toggle from "react-toggle";
import usePrevious, { floatToStr, numberWithCommas } from "../helper";
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
import CopyButton from "./CopyButton.js";
import PriceContext from "./PriceContext.js";
import UtxoPagination from "./UtxoPagination.js";

import QRCodeStyling from "qr-code-styling";
import QrButton from "./QrButton";
import { Tooltip } from "react-tooltip";
import { TransactionListSkeleton, UtxoListSkeleton } from "./SkeletonLoader";
import { BiCopy } from "react-icons/bi";
import { FaQrcode, FaCheck, FaDownload } from "react-icons/fa";

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
    if (outputs[index] && outputs[index].index == index) {
      return outputs[index].script_public_key_address;
    } else {
      if (outputs && outputs.length > 0) {
        for (var i = 0; i < outputs.length; i++) {
          if (outputs[i].index === index) {
            return outputs[i].script_public_key_address;
          }
        }
      }
    }
  };

  const getAmountFromOutputs = (outputs, index) => {
    if (outputs[index] && outputs[index].index == index) {
      return outputs[index].amount / 100000000;
    } else {
      if (outputs && outputs.length > 0) {
        for (var i = 0; i < outputs.length; i++) {
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
    var balance = 0;
    for (var i = 0; i < outputs.length; i++) {
      if (outputs[i].script_public_key_address === addr) {
        balance += outputs[i].amount / 100000000;
      }
    }
    if (inputs && inputs.length > 0) {
      for (var i = 0; i < inputs.length; i++) {
        var outputs = txsInpCache[inputs[i].previous_outpoint_hash]?.outputs;
        if (outputs !== undefined && outputs.length > 0) {
          if (getAddrFromOutputs(outputs, inputs[i].previous_outpoint_index) === addr) {
            let amount = getAmountFromOutputs(outputs, inputs[i].previous_outpoint_index);
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
        width: 200,
        height: 200,
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
    return arr.filter((item, index) => arr.indexOf(item) === index);
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
        console.log("loading done.");
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
          console.log(txInpObj);
          setTxsInpCache(txInpObj);
        });
      })
      .catch((ex) => {
        console.log("nicht eroflgreich", ex);
        setLoadingTxs(false);
      });
  }, []);

  useEffect(() => {
    setSearch({ page: activeTx });
    setLoadingTxs(true);
    window.scrollTo(0, 0);
    if (prevActiveTx !== undefined) loadTransactionsToShow(addr, 20, (activeTx - 1) * 20);
  }, [activeTx, addr, loadTransactionsToShow, prevActiveTx, setSearch]);

  useEffect(() => {
    if (view === "transactions") {
      loadTransactionsToShow(addr, 20, (activeTx - 1) * 20);
      getAddressTxCount(addr).then((totalCount) => {
        setTxCount(totalCount);
      });
      getAddressUtxos(addr).then((res) => {
        console.log("UTXOs loaded.");
        setLoadingUtxos(false);
        setUtxos(res);
      });
    }
    if (view === "utxos") {
    }
  }, [view, activeTx, addr, loadTransactionsToShow]);

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
      console.error("Error fetching transactions:", error);
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
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-full w-full">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="flex-grow-1" style={{ minWidth: '0' }}>
                    <div className="utxo-value-mono" style={{ fontSize: '0.95rem', wordBreak: 'break-all' }}>
                      <span className="addressinfo-color">hoosat:</span>{addr.substring(7, addr.length - 8)}<span className="addressinfo-color">{addr.substring(addr.length - 8)}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <OverlayTrigger
                      placement="top"
                      overlay={<BSTooltip id="copy-tooltip">{justCopied ? 'Copied!' : 'Copy Address'}</BSTooltip>}
                    >
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(addr);
                          setJustCopied(true);
                          setTimeout(() => {
                            setJustCopied(false);
                          }, 2000);
                        }}
                        style={{
                          backgroundColor: '#14B8A6',
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
                        {justCopied ? <FaCheck /> : <BiCopy />}
                      </Button>
                    </OverlayTrigger>
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
                    <Button
                      id="transactions-csv-download"
                      onClick={downloadTransactionsAsCSV}
                      disabled={isDownloading}
                      style={{
                        backgroundColor: '#14B8A6',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        height: '38px'
                      }}
                    >
                      <FaDownload />
                      {buttonText}
                    </Button>
                  </div>
                </div>
                {showQr && <div className="qr-code mt-3" ref={ref} />}
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Balance</div>
              {addressBalance !== undefined ? (
                <div className="text-hoosat-teal" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {numberWithCommas(addressBalance / 100000000)} HTN
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
            </div>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Value (USD)</div>
              {addressBalance !== undefined ? (
                <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  ${numberWithCommas(((addressBalance / 100000000) * price).toFixed(2))}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
            </div>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>UTXOs</div>
              {!loadingUtxos ? (
                <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {numberWithCommas(utxos.length)}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
              {errorLoadingUtxos && <BiGhost className="error-icon" />}
            </div>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
              <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Transactions</div>
              {txCount !== null ? (
                <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {numberWithCommas(txCount)}
                </div>
              ) : (
                <Spinner animation="border" size="sm" style={{ color: '#14B8A6' }} />
              )}
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
          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-full w-full">
            <Row className="mb-3 pb-3 align-items-center" style={{ borderBottom: '1px solid #334155' }}>
              <Col xs={12} md={6} className="d-flex flex-row align-items-center mb-3 mb-md-0">
                <h4 className="mb-0 me-3" style={{ color: '#14B8A6', fontWeight: '600' }}>Transaction History</h4>
                <div className="d-flex flex-row align-items-center">
                  <Toggle
                    defaultChecked={localStorage.getItem("detailedView") === "true"}
                    icons={false}
                    onChange={(e) => {
                      setDetailedView(e.target.checked);
                    }}
                    className="hoosat-toggle"
                  />
                  <span className="text-slate-400 ms-2" style={{ fontSize: '0.875rem' }}>Show details</span>
                </div>
              </Col>
              <Col xs={12} md={6} className="d-flex flex-row justify-content-md-end justify-content-center">
                {console.log("txc", txCount)}
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
              {txs.map((x) => (
                <>
                  <Row className="utxo-value text-primary mt-3">
                    <Col sm={7} md={7}>
                      {moment(x.block_time).format("YYYY-MM-DD HH:mm:ss")}
                    </Col>
                  </Row>
                  <Row className="pb-4 mb-0">
                    <Col sm={12} md={7}>
                      <div className="utxo-header mt-3">transaction id</div>
                      <div className="utxo-value-mono">
                        <Link className="blockinfo-link" to={`/txs/${x.transaction_id}`}>
                          {x.transaction_id}
                        </Link>
                      </div>
                    </Col>
                    <Col sm={6} md={3}>
                      <div className="utxo-header mt-3">amount</div>
                      <div className="utxo-value">
                        <Link className="blockinfo-link" to={`/txs/${x.transaction_id}`}>
                          {getAmount(x.outputs, x.inputs) > 0 ? (
                            <span className="utxo-amount">
                              +{numberWithCommas(floatToStr(getAmount(x.outputs, x.inputs)))}&nbsp;HTN
                            </span>
                          ) : (
                            <span className="utxo-amount-minus">
                              {calculationFailed(numberWithCommas(floatToStr(getAmount(x.outputs, x.inputs))))}&nbsp;HTN
                            </span>
                          )}
                        </Link>
                      </div>
                    </Col>
                    <Col sm={6} md={2}>
                      <div className="utxo-header mt-3">value</div>
                      <div className="utxo-value">
                        {numberWithCommas((getAmount(x.outputs, x.inputs) * price).toFixed(2))} $
                      </div>
                    </Col>
                  </Row>
                  {!!detailedView && (
                    <Row className="utxo-border pb-4 mb-4">
                      <Col sm={12} md={6}>
                        <div className="utxo-header mt-1">FROM</div>
                        <div className="utxo-value-mono" style={{ fontSize: "smaller" }}>
                          {x.inputs?.length > 0
                            ? x.inputs.map((x) => {
                                return txsInpCache && txsInpCache[x.previous_outpoint_hash] ? (
                                  <>
                                    <Row id={`N${x.previous_outpoint_hash}${x.previous_outpoint_index}`}>
                                      <Col xs={7} className="adressinfo-tx-overflow pb-0">
                                        <Link
                                          className="blockinfo-link"
                                          to={`/addresses/${getAddrFromOutputs(
                                            txsInpCache[x.previous_outpoint_hash]["outputs"],
                                            x.previous_outpoint_index
                                          )}`}
                                        >
                                          <span
                                            className={
                                              getAddrFromOutputs(
                                                txsInpCache[x.previous_outpoint_hash]["outputs"],
                                                x.previous_outpoint_index
                                              ) === addr
                                                ? "highlight-addr"
                                                : ""
                                            }
                                          >
                                            {getAddrFromOutputs(
                                              txsInpCache[x.previous_outpoint_hash]["outputs"],
                                              x.previous_outpoint_index
                                            )}
                                          </span>
                                        </Link>
                                      </Col>
                                      <Col xs={5}>
                                        <span className="block-utxo-amount-minus">
                                          -
                                          {numberWithCommas(
                                            getAmountFromOutputs(
                                              txsInpCache[x.previous_outpoint_hash]["outputs"],
                                              x.previous_outpoint_index
                                            )
                                          )}
                                          &nbsp;HTN
                                        </span>
                                      </Col>
                                    </Row>
                                  </>
                                ) : (
                                  <li key={`${x.previous_outpoint_hash}${x.previous_outpoint_index}`}>
                                    {x.previous_outpoint_hash} #{x.previous_outpoint_index}
                                  </li>
                                );
                              })
                            : "COINBASE (New coins)"}
                        </div>
                      </Col>
                      <Col sm={12} md={6}>
                        <div className="utxo-header mt-1">TO</div>
                        <div className="utxo-value-mono" style={{ fontSize: "smaller" }}>
                          {x.outputs.map((x) => (
                            <Row>
                              <Col xs={7} className="pb-1 adressinfo-tx-overflow">
                                <Link className="blockinfo-link" to={`/addresses/${x.script_public_key_address}`}>
                                  <span className={x.script_public_key_address === addr ? "highlight-addr" : ""}>
                                    {x.script_public_key_address}
                                  </span>
                                </Link>
                              </Col>
                              <Col xs={5}>
                                <span className="block-utxo-amount">
                                  +{numberWithCommas(x.amount / 100000000)}&nbsp;HTN
                                </span>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="utxo-header">Details</div>
                        <div
                          className="utxo-value mt-2 d-flex flex-row flex-wrap"
                          style={{ marginBottom: "-1rem", textDecoration: "none" }}
                        >
                          {x.is_accepted ? (
                            <div className="accepted-true me-3 mb-3">
                              <span data-tooltip-id="accepted-tooltip">accepted</span>
                              <Tooltip
                                id="accepted-tooltip"
                                place="top"
                                style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word" }}
                                content="A transaction may appear as unaccepted for several reasons. First the transaction may be so new that it has not been accepted yet. Second, the explorer's database filler might have missed it while processing the virtual chain. Additionally, when parallel blocks with identical blue scores are created, only one reward transaction is accepted. In rare cases, a double-spend transaction may also be rejected."
                              />
                            </div>
                          ) : (
                            <div className="accepted-false me-3 mb-3">
                              <span data-tooltip-id="accepted-tooltip">not accepted</span>
                              <Tooltip
                                id="accepted-tooltip"
                                place="top"
                                style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word" }}
                                content="A transaction may appear as unaccepted for several reasons. First the transaction may be so new that it has not been accepted yet. Second, the explorer's database filler might have missed it while processing the virtual chain. Additionally, when parallel blocks with identical blue scores are created, only one reward transaction is accepted. In rare cases, a double-spend transaction may also be rejected."
                              />
                            </div>
                          )}
                          {x.is_accepted && blueScore !== 0 && blueScore - x.accepting_block_blue_score < 86400 && (
                            <div className="confirmations mb-3">
                              <span data-tooltip-id="confirmations-tooltip">
                                {blueScore - x.accepting_block_blue_score}&nbsp;confirmations
                              </span>
                              <Tooltip
                                id="confirmations-tooltip"
                                place="top"
                                style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word" }}
                                content="Confirmations indicate how many blocks have been added after the transaction was accepted. A higher number of confirmations increases the security of the transaction. Once the confirmation count reaches 86,400, the transaction is considered finalized and cannot be reversed. Confirmations are not required for HTN wallets, exchanges require confirmations for crediting deposits."
                              />
                            </div>
                          )}
                          {x.is_accepted && blueScore !== 0 && blueScore - x.accepting_block_blue_score >= 86400 && (
                            <div className="confirmations mb-3">
                              <span data-tooltip-id="confirmations-tooltip">confirmed</span>
                              <Tooltip
                                id="confirmations-tooltip"
                                place="top"
                                style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word" }}
                                content="Confirmations indicate how many blocks have been added after the transaction was accepted. A higher number of confirmations increases the security of the transaction. Once the confirmation count reaches 86,400, the transaction is considered finalized and cannot be reversed. Confirmations are not required for HTN wallets, exchanges require confirmations for crediting deposits."
                              />
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}
                </>
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
          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-full w-full">
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
              .map((x) => (
                <>
                  <Row className="utxo-value text-primary mt-3">
                    <Col sm={7} md={7}>
                      {moment((currentEpochTime - (currentDaaScore - x.utxoEntry.blockDaaScore)) * 1000).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </Col>
                  </Row>
                  <Row className="utxo-border pb-4 mb-4">
                    <Col sm={6} md={4}>
                      <div className="utxo-header mt-3">transaction id</div>
                      <div className="utxo-value">
                        <Link className="blockinfo-link" to={`/txs/${x.outpoint.transactionId}`}>
                          {x.outpoint.transactionId}
                        </Link>
                      </div>
                    </Col>
                    <Col sm={6} md={4}>
                      <div className="utxo-header mt-3">amount</div>
                      <div className="utxo-value d-flex flex-row">
                        <div className="utxo-amount">+{numberWithCommas(x.utxoEntry.amount / 100000000)} HTN</div>
                      </div>
                    </Col>
                    <Col sm={6} md={4}>
                      <div className="utxo-header mt-3">value</div>
                      <div className="utxo-value">
                        {numberWithCommas(((x.utxoEntry.amount / 100000000) * price).toFixed(2))} $
                      </div>
                    </Col>
                    <Col sm={6} md={4}>
                      <div className="utxo-header mt-3">index</div>
                      <div className="utxo-value">{x.outpoint.index}</div>
                    </Col>
                    <Col sm={6} md={4}>
                      <div className="utxo-header mt-3">Block DAA Score</div>
                      <div className="utxo-value">{x.utxoEntry.blockDaaScore}</div>
                    </Col>
                    <Col sm={6} md={4}>
                      <div className="utxo-header mt-3">details</div>
                      <div className="utxo-value">Unspent</div>
                    </Col>
                  </Row>
                </>
              ))
          ) : (
            <UtxoListSkeleton lines={10} />
          )}
          </div>
        </Container>
      )}
    </div>
  );
};

export default AddressInfoPage;
