import React, { useState, useEffect, useCallback } from "react";
import { Container, Spinner, Pagination } from "react-bootstrap";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { PieChart, pieChartDefaultProps } from "react-minimal-pie-chart";
import { useWindowSize } from "react-use";
import { getCoinSupply } from "../htn-api-client";

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

const shiftSize = 7;

const AddressesPage = () => {
  const [circCoins, setCircCoins] = useState("-");
  const [addresses, setAddresses] = useState([]);
  const [, setYesterdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25); // You can change this number to set rows per page
  const [chartData, setChartData] = useState([]);
  const [holdingData, setHoldingData] = useState([]);
  const { width } = useWindowSize();

  const navigate = useNavigate();

  const onClickAddr = (e) => {
    navigate(`/addresses/${e.target.closest("tr").getAttribute("id")}`);
  };

  const calculateCharts = useCallback(
    (addresses) => {
      const holdingRanges = {
        "Top 10": 0,
        "Top 100": 0,
        "Top 1000": 0,
        "Top 10000": 0,
      };
      const balanceRanges = {
        "More than 10,000,000": 0,
        "More than 1,000,000": 0,
        "More than 100,000": 0,
        "More than 10,000": 0,
        "More than 1,000": 0,
        "Less than 1,000": 0,
      };
      addresses.forEach((address, index) => {
        const balance = parseFloat(address.balance);
        if (index <= 10) {
          holdingRanges["Top 10"] += balance;
        } else if (index > 10 && index <= 100) {
          holdingRanges["Top 100"] += balance;
        } else if (index > 100 && index <= 1000) {
          holdingRanges["Top 1000"] += balance;
        } else if (index > 1000 && index <= 10000) {
          holdingRanges["Top 10000"] += balance;
        }
      });
      console.log(holdingRanges);
      console.log(circCoins);
      const holdingPercentage = {
        "Top 10": (holdingRanges["Top 10"] / parseFloat(circCoins)) * 100,
        "Top 100": (holdingRanges["Top 100"] / parseFloat(circCoins)) * 100,
        "Top 1000": (holdingRanges["Top 1000"] / parseFloat(circCoins)) * 100,
        "Top 10000": (holdingRanges["Top 10000"] / parseFloat(circCoins)) * 100,
      };
      console.log(holdingPercentage);

      addresses.forEach((address) => {
        const balance = parseInt(address.balance);
        if (balance >= 10000000) {
          balanceRanges["More than 10,000,000"]++;
        } else if (balance >= 1000000 && balance < 10000000) {
          balanceRanges["More than 1,000,000"]++;
        } else if (balance >= 100000 && balance < 1000000) {
          balanceRanges["More than 100,000"]++;
        } else if (balance >= 10000 && balance < 100000) {
          balanceRanges["More than 10,000"]++;
        } else if (balance >= 1000 && balance < 10000) {
          balanceRanges["More than 1,000"]++;
        } else if (balance >= 1 && balance < 1000) {
          balanceRanges["Less than 1,000"]++;
        }
      });
      const colors = ["#FF5733", "#FFC300", "#33FF57", "#33AFFF", "#B233FF", "#FF3399"];
      const holdingData = [
        { title: "Top 10", value: holdingPercentage["Top 10"], color: colors[0] },
        { title: "Top 100", value: holdingPercentage["Top 100"], color: colors[1] },
        { title: "Top 1000", value: holdingPercentage["Top 1000"], color: colors[2] },
        { title: "Top 10000", value: holdingPercentage["Top 10000"], color: colors[3] },
      ];
      setHoldingData(holdingData);

      const chartData = [
        { title: "More than 10,000,000", value: balanceRanges["More than 10,000,000"], color: colors[0] },
        { title: "More than 1,000,000", value: balanceRanges["More than 1,000,000"], color: colors[1] },
        { title: "More than 100,000", value: balanceRanges["More than 100,000"], color: colors[2] },
        { title: "More than 10,000", value: balanceRanges["More than 10,000"], color: colors[3] },
        { title: "More than 1,000", value: balanceRanges["More than 1,000"], color: colors[4] },
        { title: "Less than 1,000", value: balanceRanges["Less than 1,000"], color: colors[5] },
      ];
      setChartData(chartData);
    },
    [circCoins]
  );

  useEffect(() => {
    if (circCoins !== "-" && addresses.length > 0) {
      calculateCharts(addresses);
    }
  }, [circCoins, addresses, calculateCharts]);

  useEffect(() => {
    const fetchCircCoins = async () => {
      const coinSupplyResp = await getCoinSupply();
      console.log(coinSupplyResp);
      setCircCoins(Math.round(coinSupplyResp.circulatingSupply / 100000000));
    };
    fetchCircCoins();
  }, []);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_ADDRESSES);
        const data = await response.text();
        const rows = data.trim().split("\n").slice(1);
        const parsedAddresses = rows.map((row, index) => {
          const [address, balance] = row.split(",");
          return { index, address, balance: parseFloat(balance) / 100000000 };
        });
        const responseYesterdays = await fetch("https://shitlist.hoosat.fi/balances-yesterday.csv");
        const dataYesterdays = await responseYesterdays.text();
        const rowsYesterdays = dataYesterdays.trim().split("\n").slice(1);
        const parsedYesterdays = rowsYesterdays.map((row, index) => {
          const [address, balance] = row.split(",");
          return { index, address, balance: parseFloat(balance) / 100000000 };
        });

        const yesterdayBalancesMap = new Map(parsedYesterdays.map((item) => [item.address, item.balance]));
        setYesterdays(yesterdayBalancesMap);
        const balanceChanges = parsedAddresses.map((address, index) => {
          const yesterdayBalance = yesterdayBalancesMap.get(address.address);
          let change = yesterdayBalance !== undefined ? address.balance - yesterdayBalance : 0;
          return { index, address: address.address, balance: address.balance, change };
        });
        setAddresses(balanceChanges);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the CSV file:", error);
        const rows = testData.trim().split("\n").slice(1);
        const parsedAddresses = rows.map((row, index) => {
          const [address, balance] = row.split(",");
          return { index, address, balance: balance / 100000000 };
        });
        const yesterdayBalancesMap = new Map(parsedAddresses.map((item) => [item.address, item.balance]));
        setYesterdays(yesterdayBalancesMap);
        setAddresses(parsedAddresses);
        setLoading(false);
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
          <div className="d-flex flex-row w-100">
            <h4 className="block-overview-header text-center w-100 mt-4">
              <RiMoneyDollarCircleFill className={"rotate"} size="1.7rem" />
              Addresses and Balances
            </h4>
          </div>
          <div className="block-overview-content">
            {loading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              <>
                <table className={`styled-table w-100`}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Balance</th>
                      <th>Change</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((address, index) => (
                      <tr key={index} id={address.address}>
                        <td>{address.index}</td>
                        <td>{Number(address.balance).toLocaleString()}</td>
                        <td className={Number(address.change) < 0 ? "text-red" : "text-white"}>{Number(address.change).toLocaleString()}</td>
                        <td className="hashh w-100" onClick={onClickAddr}>
                          {address.address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {[...Array(endPage - startPage + 1)].map((_, i) => (
                      <Pagination.Item key={startPage + i} active={startPage + i === currentPage} onClick={() => handlePageChange(startPage + i)}>
                        {startPage + i}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
                <h4 className="block-overview-header text-center w-100 mt-4">Top addresses own HTN.</h4>
                <div className="d-flex justify-content-center mt-4">
                  <PieChart
                    data={holdingData}
                    label={({ dataEntry }) => parseFloat(dataEntry.value).toFixed(2) + "% " + dataEntry.title}
                    lineWidth={10}
                    rounded
                    paddingAngle={15}
                    radius={pieChartDefaultProps.radius - shiftSize * 4}
                    segmentsShift={(index) => (index === 0 ? shiftSize : 0.5)}
                    labelStyle={(index) => ({
                      fill: holdingData[index].color,
                      fontSize: "5px",
                      fontFamily: "sans-serif",
                    })}
                    labelPosition={112}
                    style={{ maxHeight: width < 768 ? "150px" : "250px", width: "100%" }}
                    lengthAngle={-360}
                  />
                </div>
                <h4 className="block-overview-header text-center w-100 mt-4">Addresses own more than HTN.</h4>
                <div className="d-flex justify-content-center mt-4">
                  <PieChart
                    data={chartData}
                    label={({ dataEntry }) => parseFloat(dataEntry.percentage).toFixed(2) + "% " + dataEntry.title}
                    lineWidth={10}
                    rounded
                    paddingAngle={15}
                    radius={pieChartDefaultProps.radius - shiftSize * 4}
                    segmentsShift={(index) => (index === 0 ? shiftSize : 0.5)}
                    labelStyle={(index) => ({
                      fill: chartData[index].color,
                      fontSize: "5px",
                      fontFamily: "sans-serif",
                    })}
                    labelPosition={112}
                    style={{ maxHeight: width < 768 ? "150px" : "250px", width: "100%" }}
                    lengthAngle={-360}
                  />
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <p style={{ fontSize: "8pt" }}>
                    The HTN pie chart above illustrates the distribution of addresses based on their balance thresholds. For instance, addresses holding 15,000,000 HTN are categorized only under 'More than 10,000,000 HTN'. Conversely, the category
                    'Less than 1,000 HTN' excludes addresses with zero balance.
                  </p>
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <img src="/HTN-holder-rankings.webp" className="img-fluid" alt="Holder Rankings" />
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AddressesPage;
