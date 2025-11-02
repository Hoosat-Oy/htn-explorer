import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import { useContext, useState, useEffect } from "react";
import { Col, Container, Modal, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import "./App.scss";
import BalanceModal from "./components/BalanceModal";
import BlockDAGBox from "./components/BlockDAG";
import BlockOverview from "./components/BlockOverview";
import CoinsupplyBox from "./components/CoinsupplyBox";
import MarketDataBox from "./components/MarketDataBox";
import TxOverview from "./components/TxOverview";
import LastBlocksContext from "./components/LastBlocksContext";
import { getBlocks } from "./htn-api-client";

function Dashboard() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { blocks, isConnected } = useContext(LastBlocksContext);
  const handleClose = () => setShow(false);

  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const [balance] = useState(0);
  const [address] = useState("hoosat:");

  const [ghostDAG, setGhostDAG] = useState([]);

  const updateDAGData = async (blocksdata) => {
    var low_hash = blocksdata[0].block_hash;
    const { _, blocks } = await getBlocks(low_hash, true, false);

    var updatedDAG = [];
    for (var i = 0; i < blocks.length; i++) {
      var childrenHash = blocks[i].verboseData.childrenHashes[0];
      if (childrenHash === "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff") {
        break;
      }
      updatedDAG.push({
        hash: blocks[i].verboseData.hash,
        isChain: blocks[i].verboseData.isChainBlock === true ? true : false,
        selectedParent: blocks[i].verboseData.selectedParentHash,
        children: blocks[i].verboseData.childrenHashes || [],
        blueparents: blocks[i].verboseData.mergeSetBluesHashes || [],
        redparents: blocks[i].verboseData.mergeSetRedsHashes || [],
      });
    }
    setGhostDAG(updatedDAG);
  };

  // const getDAGData = async (loadVerboseForThisBlock) => {
  //   try {
  //     const maxBlocks = 40;
  //     if (
  //       loadVerboseForThisBlock.block_hash !== undefined &&
  //       (ghostDAG.length == 0 ||
  //         ghostDAG[ghostDAG.length - 1].id !==
  //           loadVerboseForThisBlock.block_hash)
  //     ) {
  //       let tries = 3;
  //       do {
  //         // Retrieve the latest block verbosedata.
  //         const block = await getBlock(loadVerboseForThisBlock.block_hash);
  //         if (block) {
  //           let newBlock = {
  //             id: loadVerboseForThisBlock.block_hash,
  //             isChain: block.verboseData.isChainBlock === true ? true : false,
  //             blueparents: block.verboseData.mergeSetBluesHashes || [],
  //             redparents: block.verboseData.mergeSetRedsHashes || [],
  //           };
  //           let blocks = ghostDAG;
  //           // Check that newblock has last block as parent.
  //           if (blocks.length > 0) {
  //             const lastBlock = blocks[blocks.length - 1];
  //             let lastBlockIsParentOfNewBlock = false;
  //             for (let i = 0; i < newBlock.blueparents.length; i++) {
  //               if (lastBlock.id === newBlock.blueparents[i]) {
  //                 lastBlockIsParentOfNewBlock = true;
  //                 break;
  //               }
  //             }
  //             for (let i = 0; i < newBlock.redparents.length; i++) {
  //               if (lastBlock.id === newBlock.redparents[i]) {
  //                 lastBlockIsParentOfNewBlock = true;
  //                 break;
  //               }
  //             }
  //             if (lastBlockIsParentOfNewBlock) {
  //               let newGhostDAG = [...blocks, newBlock];
  //               setGhostDAG(newGhostDAG.slice(-maxBlocks));
  //               return;
  //             } else {
  //               // Do a dirty fix and tie them together, it's just animation. We have just missed block fetch, even if we tried 3 times.
  //               newBlock.blueparents = [...newBlock.blueparents, lastBlock.id];
  //               let newGhostDAG = [...blocks, newBlock];
  //               setGhostDAG(newGhostDAG.slice(-maxBlocks));
  //               return;
  //             }
  //           } else {
  //             setGhostDAG([newBlock]);
  //           }
  //         }
  //         console.log(
  //           `Error fetching block ${loadVerboseForThisBlock.block_hash}, tries left ${tries}`
  //         );
  //         tries = tries - 1;
  //       } while (tries > 0);
  //     }
  //   } catch (error) {
  //     console.error(
  //       `Error fetching block ${loadVerboseForThisBlock.block_hash}:`,
  //       error
  //     );
  //   }
  // };

  useEffect(() => {
    if (blocks && blocks.length > 0) {
      //const loadVerboseForThisBlock = blocks[blocks.length - 1];
      //getDAGData(loadVerboseForThisBlock);
      // updateDAGData(blocks);
    }
  }, [blocks]);

  useEffect(() => {
    // setGhostDAG([]);
  }, []);

  //<Button variant="primary">Go!</Button>
  return (
    <div>
      <Modal show={showLoadingModal} animation={false} centered>
        <Modal.Body className="d-flex flex-row justify-content-center" style={{ backgroundColor: "#181D30" }}>
          <Spinner animation="border" variant="primary" size="xl" />
        </Modal.Body>
      </Modal>
      <div className="row2" style={{ paddingTop: '2rem' }}>
        <Container className="secondRow webpage" fluid>
          <Row className="align-items-stretch">
            <Col sm={12} md={6} xl={4} className="mb-4 d-flex">
              <BlockDAGBox />
            </Col>
            <Col sm={12} md={6} xl={4} className="mb-4 d-flex">
              <CoinsupplyBox />
            </Col>
            <Col sm={12} md={6} xl={4} className="mb-4 d-flex">
              <MarketDataBox />
            </Col>
          </Row>
        </Container>
      </div>

      <div className="row4">
        <Container className="fourthRow webpage" fluid>
          <Row>
            <Col className="" xs={12} lg={6}>
              <BlockOverview lines={12} small />
            </Col>
            <Col className="mt-5 mt-lg-0" xs={12} lg={6}>
              <TxOverview lines={12} />
            </Col>
          </Row>
        </Container>
      </div>
      {/* <div className="row3">
        <DAGGraph DAG={ghostDAG} />
      </div> */}
      <BalanceModal handleClose={handleClose} show={show} address={address} balance={balance} />
    </div>
  );
}

export default Dashboard;
