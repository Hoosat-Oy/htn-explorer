import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Spinner, Pagination } from 'react-bootstrap';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import { useNavigate } from "react-router-dom";

const testData = `
Address,Balance
hoosat:qq2eecuzygu7hptkn9rch8z8c3adr5mtyv5w69x6m5mwrvtz80wz6jqwnahml,956732578311665
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
hoosat:qz0vs7dkpatuyl5n77gpguc0dd0anmskdfp5yerss04xcljhdlkzk8yrm2kzd,956392452957145
hoosat:qz6qz78vt5h3l26rwfqhk0qj26t2xh65lrhfgpwxqqcaykp5t0l2kssn3cyaa,952404352145380
hoosat:qpldvahz3sgxsspl2wezppm99vz4r5kpqlz7ddjh2sytgx5jgmsccp9329xcy,824257538375117
        `;

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25); // You can change this number to set rows per page

  const navigate = useNavigate();

  const onClickAddr = (e) => {
    navigate(`/addresses/${e.target.closest("tr").getAttribute("id")}`)
  }

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('https://shitlist.hoosat.fi/balances.csv');
        const data = await response.text();
        const rows = data.trim().split('\n').slice(1);
        const parsedAddresses = rows.map((row, index) => {
          const [address, balance] = row.split(',');
          return { index, address, balance: balance / 100000 };
        });
        setLoading(false);
        setAddresses(parsedAddresses);
      } catch (error) {
        console.error('Error fetching the CSV file:', error);
        const rows = testData.trim().split('\n').slice(1);
        const parsedAddresses = rows.map((row, index) => {
          const [address, balance] = row.split(',');
          return { index, address, balance: balance / 100000 };
        });
        setLoading(false);
        setAddresses(parsedAddresses);
      }
    };

    fetchCSV();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(addresses.length / rowsPerPage);

  // Get current page data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = addresses.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Determine the range of pages to display
  let startPage = Math.max(1, currentPage - 4); // Ensure startPage is at least 1
  let endPage = Math.min(startPage + 9, totalPages); // Ensure endPage is within totalPages

  // Adjust startPage if endPage is less than 10 pages away from totalPages
  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - 9); // Ensure startPage is at least 1
  }

  return (
    <div className="blocks-page">
      <Container className="webpage px-md-5 blocks-page-overview" fluid>
        <div className="block-overview mb-4">
          <Row>
            <Col>
              <div className="d-flex flex-row w-100">
                <h4 className="block-overview-header text-center w-100 me-4">
                  <RiMoneyDollarCircleFill className={"rotate"} size="1.7rem" />Addresses and Balances
                </h4>
              </div>
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                <>
                  <Table className='styled-table w-100' hover>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Address</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows.map((address, index) => (
                        <tr key={index}
                          id={address.address}>
                          <td>{address.index}</td>
                          <td className='hash' onClick={onClickAddr}>{address.address}</td>
                          <td>{Number(address.balance).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="d-flex justify-content-center">
                    <Pagination>
                      <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                      {[...Array(endPage - startPage + 1)].map((_, i) => (
                          <Pagination.Item 
                              key={startPage + i} 
                              active={startPage + i === currentPage} 
                              onClick={() => handlePageChange(startPage + i)}
                          >
                              {startPage + i}
                          </Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                      <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default AddressesPage;
