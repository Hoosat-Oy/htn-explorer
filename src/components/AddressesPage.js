import React, { useState, useEffect, useCallback } from "react";
import { Container, Spinner, Pagination } from "react-bootstrap";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { PieChart, pieChartDefaultProps } from "react-minimal-pie-chart";
import { useWindowSize } from "react-use";
import { getCoinSupply } from "../htn-api-client";

const shiftSize = 7;

const tags = new Map([
  [
    "hoosat:qzm5vg7uv66ze6mv8d32xhv50sxwhthkz9ly7049e87hr2rm7wr6zjxytztv7",
    "Burn Address",
  ],
  [
    "hoosat:qp4ad2eh72xc8dtjjyz4llxzq9utn6k26uyl644xxw70wskdfl85zsqj9k4vz",
    "Developer fee",
  ],
  [
    "hoosat:qpfmzu6566ejkcfgktrcm2v3e3w9m7u4gandyy2aulhzugcps3ln7dcq87qz2",
    "Xeggex",
  ],
  [
    "hoosat:qzs4g22nvzl66lnt74wcy9lvu4kk4ka0w9hdhxyt5aem24r7q5v45wlqzxkwv",
    "Kenz",
  ],
  [
    "hoosat:qqfyxz4lrve2y2wzr6zr4qusrtryln24fzd0hpqkwqrlx9qj2sedq92k4my7k",
    "Gran Búho Verde",
  ],
  [
    "hoosat:qq96y2ew87phurzktjmttsmeh6eaymgndaatnsw7ze6pxf7xga3tuhzt9t8jv",
    "S.I.G ",
  ],
  [
    "hoosat:qr97kz9ujwylwxd8jkh9zs0nexlkkuu0v3aj0a6htvapan0a0arjugmlqf5ur",
    "Mutiq",
  ],
  [
    "hoosat:qqdythqca8axcrvl7k0ep62yyzprcv8qw4xvlyvwnq7srx3angqrk92n74kut",
    "OWL DICK",
  ],
  [
    "hoosat:qrhed37kge64z6agkq82l7xce423ugdf308ehtsh72y2nee7x2kvzxv6xqwd4",
    "M4P PPLNSBF5",
  ],
  [
    "hoosat:qpuvlmta9s07znc3hf0j4jvuwkgxzus5aen7echhr4mg5y4naxcxyuhetmvq9",
    "M4P   ",
  ],
  [
    "hoosat:qrk3xclt5m27hw3w3hp7mvawg9pnvxskk8x5xt9jugg7alm09ltkvf4uueqgl",
    "Klein",
  ],
]);

const AddressesPage = () => {
  const [circCoins, setCircCoins] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [yAddresses, setYAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25); // You can change this number to set rows per page
  const [chartData, setChartData] = useState([]);
  const [holdingData, setHoldingData] = useState([]);
  const [totalPages, setTotalPages] = useState([]);
  const [startPage, setStartPage] = useState([]);
  const [endPage, setEndPage] = useState([]);
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
      const colors = [
        "#FF5733",
        "#FFC300",
        "#33FF57",
        "#33AFFF",
        "#B233FF",
        "#FF3399",
      ];
      const holdingData = [
        {
          title: "Top 10",
          value: holdingPercentage["Top 10"],
          color: colors[0],
        },
        {
          title: "Top 100",
          value: holdingPercentage["Top 100"],
          color: colors[1],
        },
        {
          title: "Top 1000",
          value: holdingPercentage["Top 1000"],
          color: colors[2],
        },
        {
          title: "Top 10000",
          value: holdingPercentage["Top 10000"],
          color: colors[3],
        },
      ];
      setHoldingData(holdingData);

      const chartData = [
        {
          title: "More than 10,000,000",
          value: balanceRanges["More than 10,000,000"],
          color: colors[0],
        },
        {
          title: "More than 1,000,000",
          value: balanceRanges["More than 1,000,000"],
          color: colors[1],
        },
        {
          title: "More than 100,000",
          value: balanceRanges["More than 100,000"],
          color: colors[2],
        },
        {
          title: "More than 10,000",
          value: balanceRanges["More than 10,000"],
          color: colors[3],
        },
        {
          title: "More than 1,000",
          value: balanceRanges["More than 1,000"],
          color: colors[4],
        },
        {
          title: "Less than 1,000",
          value: balanceRanges["Less than 1,000"],
          color: colors[5],
        },
      ];
      setChartData(chartData);
    },
    [circCoins]
  );

  useEffect(() => {
    if (yAddresses.length > 0) {
      calculateCharts(yAddresses);
    }
  }, [yAddresses, calculateCharts]);

  useEffect(() => {
    const fetchCircCoins = async () => {
      const coinSupplyResp = await getCoinSupply();
      console.log(coinSupplyResp);
      setCircCoins(Math.round(coinSupplyResp.circulatingSupply / 100000000));
    };
    fetchCircCoins();
  }, []);

  useEffect(() => {
    const fetchAddressBalancesForPage = async () => {
      try {
        const response = await fetch(
          `https://api.network.hoosat.fi/addresses/balances/csv/paged?page=${currentPage}&items_per_page=${rowsPerPage}`
        );
        const data = await response.text();
        const rows = data.trim().split("\n").slice(1);
        const parsedAddresses = rows.map((row, index) => {
          const [address, balance] = row.split(",");
          return {
            index: index * currentPage,
            address,
            balance: parseFloat(balance) / 100000000,
          };
        });
        const yesterdayBalancesMap = new Map(
          yAddresses.map((item) => [item.address, item.balance])
        );
        const balanceChanges = parsedAddresses.map((address, index) => {
          const yesterdayBalance = yesterdayBalancesMap.get(address.address);
          const tag = tags.get(address.address);
          let change =
            yesterdayBalance !== undefined
              ? address.balance - yesterdayBalance
              : 0;
          return {
            index: (currentPage - 1) * rowsPerPage + index,
            address: address.address,
            balance: address.balance,
            change: change,
            tag: tag,
          };
        });
        setAddresses(balanceChanges);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the CSV file:", error);
        setLoading(false);
      }
    };
    fetchAddressBalancesForPage();
    const interval = setInterval(() => {
      fetchAddressBalancesForPage();
    }, 60000);
    return () => clearInterval(interval);
  }, [yAddresses, currentPage, rowsPerPage]);

  useEffect(() => {
    const addTagAddressesFromFile = async (tag) => {
      try {
        const response = await fetch(
          `https://shitlist.hoosat.fi/tags/${tag}.csv`
        );
        const addressesResponse = await response.text();
        const addressesRows = addressesResponse.trim().split("\n");
        const parsedAddresses = addressesRows.map((row, _) => {
          return row;
        });
        parsedAddresses.forEach((address) => {
          tags.set(address, tag.charAt(0).toUpperCase() + tag.slice(1));
        });
        console.log(tags);
      } catch (error) {
        console.error("Error fetching the CSV file:", error.message);
      }
    };
    const fetchYesterdaysCSV = async () => {
      try {
        const responseYesterdays = await fetch(
          "https://shitlist.hoosat.fi/balances-yesterday.csv"
        );
        const dataYesterdays = await responseYesterdays.text();
        const rowsYesterdays = dataYesterdays.trim().split("\n").slice(1);
        const parsedYesterdays = rowsYesterdays.map((row, index) => {
          const [address, balance] = row.split(",");
          return { index, address, balance: parseFloat(balance) / 100000000 };
        });
        console.log("Fetched yesterdays addresses.");
        setYAddresses(parsedYesterdays);
        setTotalPages(Math.ceil(parsedYesterdays.length));
      } catch (error) {
        console.error("Error fetching the CSV file:", error);
        setLoading(false);
      }
    };
    addTagAddressesFromFile("xeggex");
    fetchYesterdaysCSV();
  }, []);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(startPage + 9, totalPages);
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 9);
    }
    console.log(
      `Total pages ${totalPages} and start page ${startPage} and end page ${endPage}`
    );
    setStartPage(startPage);
    setEndPage(endPage);
  }, [totalPages]);

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
                    {addresses.map((address, index) => (
                      <tr key={index} id={address.address}>
                        <td>{address.index}</td>
                        <td>{Number(address.balance).toLocaleString()}</td>
                        <td
                          className={
                            Number(address.change) < 0
                              ? "text-red"
                              : "text-white"
                          }
                        >
                          {Number(address.change).toLocaleString()}
                        </td>
                        <td className="hashh w-100" onClick={onClickAddr}>
                          {address.address}
                        </td>
                        <td className="nowrap">{address.tag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    {[...Array(endPage - startPage + 1)].map((_, i) => (
                      <Pagination.Item
                        key={startPage + i}
                        active={startPage + i === currentPage}
                        onClick={() => handlePageChange(startPage + i)}
                      >
                        {startPage + i}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
                <h4 className="block-overview-header text-center w-100 mt-4">
                  Top addresses own HTN.
                </h4>
                <div className="d-flex justify-content-center mt-4">
                  <PieChart
                    data={holdingData}
                    label={({ dataEntry }) =>
                      parseFloat(dataEntry.value).toFixed(2) +
                      "% " +
                      dataEntry.title
                    }
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
                    style={{
                      maxHeight: width < 768 ? "150px" : "250px",
                      width: "100%",
                    }}
                    lengthAngle={-360}
                  />
                </div>
                <h4 className="block-overview-header text-center w-100 mt-4">
                  Addresses own more than HTN.
                </h4>
                <div className="d-flex justify-content-center mt-4">
                  <PieChart
                    data={chartData}
                    label={({ dataEntry }) =>
                      parseFloat(dataEntry.percentage).toFixed(2) +
                      "% " +
                      dataEntry.title
                    }
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
                    style={{
                      maxHeight: width < 768 ? "150px" : "250px",
                      width: "100%",
                    }}
                    lengthAngle={-360}
                  />
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <p style={{ fontSize: "8pt" }}>
                    The HTN pie chart above illustrates the distribution of
                    addresses based on their balance thresholds. For instance,
                    addresses holding 15,000,000 HTN are categorized only under
                    'More than 10,000,000 HTN'. Conversely, the category 'Less
                    than 1,000 HTN' excludes addresses with zero balance.
                  </p>
                  <p style={{ fontSize: "8pt" }}>
                    If you want to tag your address please feel free to open a
                    ticket in discord or do a pull request in Github.
                  </p>
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <img
                    src="/HTN-holder-rankings.webp"
                    className="img-fluid"
                    alt="Holder Rankings"
                  />
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
