import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react";
import { getBlockdagInfo } from '../htn-api-client';


const BlockDAGBox = () => {


    const [blockCount, setBlockCount] = useState();
    const [difficulty, setDifficulty] = useState();
    const [headerCount, setHeaderCount] = useState("");
    const [virtualDaaScore, setVirtualDaaScore] = useState("");
    const [hashrate, setHashrate] = useState("");

    const initBox = async () => {
        const dag_info = await getBlockdagInfo()
        console.log('DAG Info ', dag_info)
        setBlockCount(dag_info.blockCount)
        setHeaderCount(dag_info.headerCount)
        setVirtualDaaScore(dag_info.virtualDaaScore)
        setDifficulty(dag_info.difficulty)
        setHashrate((dag_info.difficulty * 2 / 1000000000000).toFixed(2))
    }

    useEffect(() => {
        initBox();
        const updateInterval = setInterval(async () => {
            const dag_info = await getBlockdagInfo()
            setBlockCount(dag_info.blockCount)
            setHeaderCount(dag_info.headerCount)
            setVirtualDaaScore(dag_info.virtualDaaScore)
            setDifficulty(dag_info.difficulty)
            setHashrate((dag_info.difficulty * 2 / 1000000000000).toFixed(2))
        }, 60000)
        return (async () => {
            clearInterval(updateInterval)
        })
    }, [])

    useEffect((e) => {
        document.getElementById('blockCount').animate([
            // keyframes
            { opacity: '1' },
            { opacity: '0.6' },
            { opacity: '1' },
        ], {
            // timing options
            duration: 300
        });
    }, [blockCount])

    useEffect((e) => {
        document.getElementById('headerCount').animate([
            // keyframes
            { opacity: '1' },
            { opacity: '0.6' },
            { opacity: '1' },
        ], {
            // timing options
            duration: 300
        });
    }, [headerCount])

    useEffect((e) => {
        document.getElementById('virtualDaaScore').animate([
            // keyframes
            { opacity: '1' },
            { opacity: '0.6' },
            { opacity: '1' },
        ], {
            // timing options
            duration: 300
        });
    }, [virtualDaaScore])

    useEffect((e) => {
        document.getElementById('hashrate').animate([
            // keyframes
            { opacity: '1' },
            { opacity: '0.6' },
            { opacity: '1' },
        ], {
            // timing options
            duration: 300
        });
    }, [hashrate])


    return <>
        <div className="cardBox mx-0">
            <table style={{ fontSize: "1rem" }}>
                <tbody>
                    <tr>
                        <td colSpan='2' className="text-center" style={{ "fontSize": "4rem" }}>
                            <FontAwesomeIcon icon={faDiagramProject} />
                            <div className="cardLight" />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" className="text-center">
                            <h3>BLOCKDAG INFO</h3>
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Network name
                        </td>
                        <td className="pt-1 text-nowrap">
                            hoosat-mainnet
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Block height
                        </td>
                        <td className="pt-1" id="blockCount">
                            {Number(blockCount).toLocaleString()}
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Header height
                        </td>
                        <td className="pt-1" id="headerCount">
                            {Number(headerCount).toLocaleString()}
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Difficulty
                        </td>
                        <td className="pt-1 align-top" id="virtualDaaScore">
                            {(Number(difficulty) / 1e12).toFixed(3)} T
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Hashrate
                        </td>
                        <td className="pt-1" id="hashrate">
                            {(Number(hashrate)).toFixed(3)} TH/s
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Virtual DAA
                        </td>
                        <td className="pt-1 align-top" id="virtualDaaScore">
                            {Number(virtualDaaScore).toLocaleString()}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>
}


export default BlockDAGBox;
