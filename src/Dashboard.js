import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import { Col, Container, Row } from "react-bootstrap";
import "./App.scss";
import BlockDAGBox from "./components/BlockDAG";
import BlockOverview from "./components/BlockOverview";
import CoinsupplyBox from "./components/CoinsupplyBox";
import MarketDataBox from "./components/MarketDataBox";
import TxOverview from "./components/TxOverview";

function Dashboard() {
  return (
    <div>
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
    </div>
  );
}

export default Dashboard;
