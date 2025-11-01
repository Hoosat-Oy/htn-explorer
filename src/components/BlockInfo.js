/* global BigInt */

import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Col, Container, OverlayTrigger, Row, Spinner, Tooltip } from "react-bootstrap";
import { BiNetworkChart, BiChevronDown, BiChevronUp } from "react-icons/bi";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { parsePayload } from "../bech32.js";
import { numberWithCommas } from "../helper.js";
import { getBlock, getTransactions } from "../htn-api-client.js";
import BlueScoreContext from "./BlueScoreContext.js";
import CopyButton from "./CopyButton.js";
import PriceContext from "./PriceContext.js";
import { Tooltip as ReactTooltip } from "react-tooltip";
import TransactionItem from "./TransactionItem.js";
import { BlockDetailsSkeleton } from "./SkeletonLoader.js";

const BlockLamp = (props) => {
  return (
    <OverlayTrigger overlay={<Tooltip>It is a {props.isBlue ? "blue" : "red"} block!</Tooltip>}>
      <div className={`ms-3 block-lamp-${props.isBlue ? "blue" : "red"}`} />
    </OverlayTrigger>
  );
};

const BlockInfo = () => {
  const { id } = useParams();
  const { blueScore } = useContext(BlueScoreContext);
  const [blockInfo, setBlockInfo] = useState();
  const [txInfo, setTxInfo] = useState();
  const [minerName, setMinerName] = useState();
  const [minerAddress, setMinerAddress] = useState();
  const [isBlueBlock, setIsBlueBlock] = useState(null);
  const [error, setError] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const { price } = useContext(PriceContext);

  useEffect(() => {
    setError(false);
    getBlock(id)
      .then((res) => {
        setBlockInfo(res);
      })
      .catch(() => {
        setError(true);
        setBlockInfo(null);
      });
  }, [id]);

  useEffect(() => {
    setIsBlueBlock(null);
    if (!!blockInfo) {
      async function isBlueBlock(startBlocks) {
        var childListGlob = startBlocks;

        while (childListGlob.length > 0) {
          const hash = childListGlob.shift();
          const block = await getBlock(hash);
          if (block.verboseData.isChainBlock) {
            return block.verboseData.mergeSetBluesHashes.includes(blockInfo.verboseData.hash);
          } else {
            // console.log("PUSH", block.verboseData.childrenHashes)
            childListGlob.push(block.verbosedata.childrenHashes);
          }
        }
      }

      isBlueBlock([...(blockInfo.verboseData.childrenHashes || [])])
        .then((res) => setIsBlueBlock(res))
        .catch((err) => console.log("ERROR", err));

      let [address, miner] = ["No miner info", "No miner info"];

      if (blockInfo.transactions[0]?.payload) {
        [address, miner] = parsePayload(blockInfo.transactions[0].payload);
      }

      // request TX input addresses
      const txToQuery = blockInfo.transactions
        .flatMap((tx) => tx.inputs?.flatMap((txInput) => txInput.previousOutpoint.transactionId))
        .filter((x) => x)
        .concat(blockInfo.transactions.map((tx) => tx.verboseData.transactionId));

      getTransactions(txToQuery, true, true)
        .then((resp) => {
          const respAsObj = resp.reduce((obj, cur) => {
            obj[cur["transaction_id"]] = cur;
            return obj;
          }, {});
          console.log(respAsObj);
          setTxInfo(respAsObj);
        })
        .catch((err) => console.log("Error ", err));

      setMinerName(miner);
      setMinerAddress(address);
    }
  }, [blockInfo]);

  if (!blockInfo && !error) {
    return <BlockDetailsSkeleton />;
  }

  return (
    <div className="blockinfo-page">
      <Container className="webpage" fluid style={{ paddingTop: '2rem' }}>
        <Row>
          <Col xs={12}>
            {error ? <h1 variant="danger">Error loading block</h1> : <></>}

            {!!blockInfo && (
              <h2 className="text-white mb-4" style={{ fontSize: '2rem', fontWeight: '700' }}>Block Details</h2>
            )}
          </Col>
        </Row>

        <Row>
          <Col className="mx-0">
            {!!blockInfo ? (
              <>
                {/* Block Hash Card - similar to Address Card */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 h-full w-full">
                      {/* Block Hash with Copy Button and Lamp */}
                      <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="flex-grow-1 d-flex align-items-center gap-2" style={{ minWidth: '0' }}>
                            <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.95rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                              <span className="text-slate-200">Hash: {blockInfo.verboseData.hash}</span>
                              <CopyButton text={blockInfo.verboseData.hash} />
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {blockInfo.verboseData.isChainBlock !== null && (
                              <>
                                {isBlueBlock === null ? (
                                  <Spinner animation="grow" size="sm" style={{ color: '#14B8A6' }} />
                                ) : (
                                  <BlockLamp isBlue={isBlueBlock} />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats Cards inside block card */}
                      <Row className="g-3 mt-3 pt-3" style={{ borderTop: '1px solid #334155' }}>
                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Blue Score</div>
                            <div className="text-hoosat-teal" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {numberWithCommas(blockInfo.header.blueScore)}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Timestamp</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {moment(parseInt(blockInfo.header.timestamp)).format("YYYY-MM-DD HH:mm:ss")}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Is Chain Block</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {!!blockInfo.verboseData.isChainBlock ? "true" : "false"}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Transactions</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {numberWithCommas(blockInfo.transactions?.length || 0)}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Second row of stats */}
                      <Row className="g-3 mt-3">
                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Bits</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {blockInfo.header.bits}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Version</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {blockInfo.header.version}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>Nonce</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {blockInfo.header.nonce}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                          <div className="bg-hoosat-slate/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 hover:shadow-xl hover:shadow-hoosat-teal/20 h-100">
                            <div className="text-slate-400 mb-2" style={{ fontSize: '0.875rem' }}>DAA Score</div>
                            <div className="text-white" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                              {numberWithCommas(blockInfo.header.daaScore)}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Show Additional Details Button */}
                      <div className="mt-4 pt-3" style={{ borderTop: '1px solid #334155' }}>
                        <button
                          onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                          className="d-flex align-items-center gap-2 bg-transparent border-0 text-slate-400 hover:text-hoosat-teal transition-colors"
                          style={{ cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' }}
                        >
                          {showAdditionalDetails ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
                          <span>{showAdditionalDetails ? 'Hide Additional Details' : 'Show Additional Details'}</span>
                        </button>

                        {/* Additional Details - Expandable */}
                        <div
                          style={{
                            maxHeight: showAdditionalDetails ? '5000px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease-in-out',
                            opacity: showAdditionalDetails ? 1 : 0
                          }}
                        >
                          <div className="mt-4">
                              {/* Technical Details Row */}
                              <Row className="g-3 mb-3">
                                  <Col xs={12} md={6}>
                                      <div className="bg-hoosat-slate/30 p-3 rounded-xl border border-slate-700">
                                          <div className="text-slate-400 mb-1" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                              Merkle Root
                                          </div>
                                          <div className="text-slate-300 font-mono" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                              {blockInfo.header.hashMerkleRoot}
                                          </div>
                                      </div>
                                  </Col>
                                  <Col xs={12} md={6}>
                                      <div className="bg-hoosat-slate/30 p-3 rounded-xl border border-slate-700">
                                          <div className="text-slate-400 mb-1" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                              Accepted Merkle Root
                                          </div>
                                          <div className="text-slate-300 font-mono" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                              {blockInfo.header.acceptedIdMerkleRoot}
                                          </div>
                                      </div>
                                  </Col>
                                  <Col xs={12} md={6}>
                                      <div className="bg-hoosat-slate/30 p-3 rounded-xl border border-slate-700">
                                          <div className="text-slate-400 mb-1" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                              UTXO Commitment
                                          </div>
                                          <div className="text-slate-300 font-mono" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                              {blockInfo.header.utxoCommitment}
                                          </div>
                                      </div>
                                  </Col>
                                  <Col xs={12} md={6}>
                                      <div className="bg-hoosat-slate/30 p-3 rounded-xl border border-slate-700">
                                          <div className="text-slate-400 mb-1" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                              Blue Work
                                          </div>
                                          <div className="text-slate-300 font-mono" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                              {blockInfo.header.blueWork} ({BigInt(`0x${blockInfo.header.blueWork}`).toString()})
                                          </div>
                                      </div>
                                  </Col>
                              </Row>

                            {/* Selected Parent Hash */}
                            <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                              <div className="col-12 col-md-3">
                                <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                  Selected Parent Hash
                                </div>
                              </div>
                              <div className="col-12 col-md-9">
                                <Link
                                  to={`/blocks/${blockInfo.verboseData.selectedParentHash}`}
                                  className="text-hoosat-teal hover:text-teal-400 font-mono"
                                  style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                >
                                  {blockInfo.verboseData.selectedParentHash}
                                </Link>
                              </div>
                            </div>

                            {/* Parents */}
                            <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                              <div className="col-12 col-md-3">
                                <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                  Parents ({blockInfo.header.parents[0].parentHashes.length})
                                </div>
                              </div>
                              <div className="col-12 col-md-9">
                                <div className="d-flex flex-column gap-2">
                                  {blockInfo.header.parents[0].parentHashes.map((hash, idx) => (
                                    <Link
                                      key={idx}
                                      to={`/blocks/${hash}`}
                                      className="text-hoosat-teal hover:text-teal-400 font-mono"
                                      style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                    >
                                      {hash}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Mergeset Blues Hashes */}
                            {blockInfo.verboseData.mergeSetBluesHashes && blockInfo.verboseData.mergeSetBluesHashes.length > 0 && (
                              <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                                <div className="col-12 col-md-3">
                                  <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                    Mergeset Blues ({blockInfo.verboseData.mergeSetBluesHashes.length})
                                  </div>
                                </div>
                                <div className="col-12 col-md-9">
                                  <div className="d-flex flex-column gap-2">
                                    {blockInfo.verboseData.mergeSetBluesHashes.map((hash, idx) => (
                                      <Link
                                        key={idx}
                                        to={`/blocks/${hash}`}
                                        className="text-hoosat-teal hover:text-teal-400 font-mono"
                                        style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                      >
                                        {hash}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Mergeset Reds Hashes */}
                            {blockInfo.verboseData.mergeSetRedsHashes && blockInfo.verboseData.mergeSetRedsHashes.length > 0 && (
                              <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                                <div className="col-12 col-md-3">
                                  <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                    Mergeset Reds ({blockInfo.verboseData.mergeSetRedsHashes.length})
                                  </div>
                                </div>
                                <div className="col-12 col-md-9">
                                  <div className="d-flex flex-column gap-2">
                                    {blockInfo.verboseData.mergeSetRedsHashes.map((hash, idx) => (
                                      <Link
                                        key={idx}
                                        to={`/blocks/${hash}`}
                                        className="text-hoosat-teal hover:text-teal-400 font-mono"
                                        style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                      >
                                        {hash}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Children */}
                            {blockInfo.verboseData.childrenHashes && blockInfo.verboseData.childrenHashes.length > 0 && (
                              <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                                <div className="col-12 col-md-3">
                                  <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                    Children ({blockInfo.verboseData.childrenHashes.length})
                                  </div>
                                </div>
                                <div className="col-12 col-md-9">
                                  <div className="d-flex flex-column gap-2">
                                    {blockInfo.verboseData.childrenHashes.map((hash, idx) => (
                                      <Link
                                        key={idx}
                                        to={`/blocks/${hash}`}
                                        className="text-hoosat-teal hover:text-teal-400 font-mono"
                                        style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                      >
                                        {hash}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}



                            {/* Pruning Point */}
                            <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                              <div className="col-12 col-md-3">
                                <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                  Pruning Point
                                </div>
                              </div>
                              <div className="col-12 col-md-9">
                                <Link
                                  to={`/blocks/${blockInfo.header.pruningPoint}`}
                                  className="text-hoosat-teal hover:text-teal-400 font-mono"
                                  style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                >
                                  {blockInfo.header.pruningPoint}
                                </Link>
                              </div>
                            </div>

                            {/* Miner Info */}
                            <div className="row py-3" style={{ borderBottom: '1px solid #334155' }}>
                              <div className="col-12 col-md-3">
                                <div className="text-slate-400" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                  Miner Info
                                </div>
                              </div>
                              <div className="col-12 col-md-9">
                                <div className="text-slate-300 mb-2" style={{ fontSize: '0.9rem' }}>
                                  {minerName}
                                </div>
                                <Link
                                  to={`/addresses/${minerAddress}`}
                                  className="text-hoosat-teal hover:text-teal-400 font-mono"
                                  style={{ fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                                >
                                  {minerAddress}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              <></>
            )}
          </Col>
        </Row>

        <Row>
          <Col>
            {!!blockInfo && !!txInfo ? (
              <div className="mt-4 mb-5">
                <div className="bg-hoosat-slate/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 h-full w-full">
                  <div className="mb-3 pb-3 text-left" style={{ borderBottom: '1px solid #334155' }}>
                    <h4 className="mb-0" style={{ color: '#14B8A6', fontWeight: '600' }}>
                      Transaction History ({blockInfo.transactions?.length || 0})
                    </h4>
                  </div>
                <div>
                  {(blockInfo.transactions || []).map((tx, tx_index) => {
                    const txData = txInfo[tx.verboseData.transactionId];

                    // Transform to TransactionItem format
                    const transformedTx = {
                      transaction_id: tx.verboseData.transactionId,
                      block_time: blockInfo.header.timestamp,
                      is_accepted: txData?.is_accepted || false,
                      accepting_block_blue_score: txData?.accepting_block_blue_score || 0,
                      inputs: tx.inputs?.map(input => ({
                        previous_outpoint_hash: input.previousOutpoint.transactionId,
                        previous_outpoint_index: input.previousOutpoint.index || 0
                      })) || [],
                      outputs: tx.outputs?.map(output => ({
                        script_public_key_address: output.verboseData.scriptPublicKeyAddress,
                        amount: output.amount
                      })) || []
                    };

                    // Helper function to calculate amount (total outputs)
                    const getAmount = (outputs) => {
                      return outputs.reduce((sum, output) => sum + (output.amount / 100000000), 0);
                    };

                    // Helper function to get address from outputs
                    const getAddrFromOutputsHelper = (outputs, index) => {
                      const output = outputs.find(o => o.index === index);
                      return output?.script_public_key_address || '';
                    };

                    // Helper function to get amount from outputs
                    const getAmountFromOutputsHelper = (outputs, index) => {
                      const output = outputs.find(o => o.index === index);
                      return output ? output.amount / 100000000 : 0;
                    };

                    // Since this is block view (no specific address context), amount is always positive (showing total)
                    const calculationFailed = (val) => val;

                    return (
                      <TransactionItem
                        key={tx.verboseData.transactionId}
                        transaction={transformedTx}
                        addr={null}
                        price={price}
                        blueScore={blueScore}
                        txsInpCache={txInfo}
                        getAmount={(outputs) => getAmount(outputs)}
                        getAddrFromOutputs={getAddrFromOutputsHelper}
                        getAmountFromOutputs={getAmountFromOutputsHelper}
                        calculationFailed={calculationFailed}
                        detailedView={false}
                      />
                    );
                  })}
                </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BlockInfo;
