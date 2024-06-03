import { faMemory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useCallback } from "react";

const KaspadInfoBox = () => {
  const [data, setData] = useState({});

  const updateData = useCallback(() => {
    const fetchInfo = async () => {
      await fetch(`${process.env.REACT_APP_API}/info/htnd`)
        .then((response) => response.json())
        .then((d) => setData(d))
        .catch((err) => console.log("Error", err));
      setTimeout(updateData, 60000);
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    updateData();
  }, [updateData]);

  return (
    <>
      <div className="cardBox mx-0">
        <table>
          <tbody>
            <tr>
              <td colSpan="2" className="text-center" style={{ fontSize: "4rem" }}>
                <FontAwesomeIcon icon={faMemory} />
                <div className="cardLight" />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="text-center">
                <h3>HTND INFO</h3>
              </td>
            </tr>
            <tr>
              <td className="cardBoxElement">Mempool size</td>
              <td className="">{data.mempoolSize}</td>
            </tr>
            <tr>
              <td className="cardBoxElement">Server version</td>
              <td className="">{data.serverVersion}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default KaspadInfoBox;
