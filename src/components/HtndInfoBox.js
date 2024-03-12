import { faMemory } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react";
import { FaMemory } from 'react-icons/fa';



const KaspadInfoBox = () => {
    const [data, setData] = useState({});

    async function updateData() {
        await fetch('https://api.network.hoosat.fi/info/htnd')
            .then((response) => response.json())
            .then(d => setData(d))
            .catch(err => console.log("Error", err))
        setTimeout(updateData, 60000)
    }
    useEffect(() => {

        updateData()
    }, [])


    return <>
        <div className="cardBox mx-0">
            <table>
                <tbody>
                    <tr>
                        <td colSpan='2' className="text-center" style={{ "fontSize": "4rem" }}>
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
                        <td className="cardBoxElement">
                            Mempool size
                        </td>
                        <td className="">
                            {data.mempoolSize}
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Server version
                        </td>
                        <td className="">
                            {data.serverVersion}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>
}


export default KaspadInfoBox