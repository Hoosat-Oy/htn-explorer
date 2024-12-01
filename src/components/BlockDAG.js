import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react";
import { getBlockdagInfo, getInfo } from '../htn-api-client';


const BlockDAGBox = () => {

    const [nextHFDAAScore, setNextHFDAAScore] = (21821800);
    const [showHF, setShowHF] = useState(false);
    const [blockCount, setBlockCount] = useState();
    const [difficulty, setDifficulty] = useState();
    const [headerCount, setHeaderCount] = useState("");
    const [virtualDaaScore, setVirtualDaaScore] = useState("");
    const [hashrate, setHashrate] = useState("");
    const [nextHardForkTime, setNextHardForkTime] = useState("");
    const [nextHardForkTimeTo, setNextHardForkTimeTo] = useState("");
    const [mempoolSize, setMempoolSize] = useState();

    const initBox = async () => {
        const dag_info = await getBlockdagInfo()
        console.log('DAG Info ', dag_info)
        setBlockCount(dag_info.blockCount)
        setHeaderCount(dag_info.headerCount)
        setVirtualDaaScore(dag_info.virtualDaaScore)
        setDifficulty(dag_info.difficulty)
        setHashrate((dag_info.difficulty * 2 / 1000000000).toFixed(2))
        const info = await getInfo();
        setMempoolSize(info.mempoolSize);
        const unixTimestamp = Math.floor(Date.now() / 1000);
        const timeToFork = (nextHFDAAScore) - dag_info.virtualDaaScore;
        const hardForkTime = new Date((unixTimestamp + timeToFork) * 1000).toUTCString();
        if (timeToFork > 0) {
            const hours = Math.floor(timeToFork / 3600);
            const minutes = Math.floor((timeToFork % 3600) / 60);
            const seconds = timeToFork % 60;
            const formattedTimeToFork = `${hours}h ${minutes}m ${seconds}s`;
            setShowHF(true);
            setNextHardForkTime(hardForkTime)
            setNextHardForkTimeTo(formattedTimeToFork);
        }
    }

    useEffect(() => {
        initBox();
        const updateInterval = setInterval(async () => {
            const dag_info = await getBlockdagInfo()
            setBlockCount(dag_info.blockCount)
            setHeaderCount(dag_info.headerCount)
            setVirtualDaaScore(dag_info.virtualDaaScore)
            setDifficulty(dag_info.difficulty)
            setHashrate((dag_info.difficulty * 2 / 1000000000).toFixed(2))
            const unixTimestamp = Math.floor(Date.now() / 1000);
            const timeToFork = (nextHFDAAScore) - dag_info.virtualDaaScore;
            const hardForkTime = new Date((unixTimestamp + timeToFork) * 1000).toUTCString();
            if (timeToFork > 0) {
                const hours = Math.floor(timeToFork / 3600);
                const minutes = Math.floor((timeToFork % 3600) / 60);
                const seconds = timeToFork % 60;
                const formattedTimeToFork = `${hours}h ${minutes}m ${seconds}s`;
                setShowHF(true);
                setNextHardForkTime(hardForkTime)
                setNextHardForkTimeTo(formattedTimeToFork);
            }
        }, 60000)
        return (async () => {
            clearInterval(updateInterval)
        })
        
    }, [])

    useEffect(() => {
        const updateInterval = setInterval(async () => {
            const info = await getInfo();
            setMempoolSize(info.mempoolSize);
        }, 1000)
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

    useEffect((e) => {
        document.getElementById('nextHardForkTime').animate([
            // keyframes
            { opacity: '1' },
            { opacity: '0.6' },
            { opacity: '1' },
        ], {
            // timing options
            duration: 300
        });
    }, [nextHardForkTime])


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
                            <h3>NETWORK INFO</h3>
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement nowrap">
                            Network name
                        </td>
                        <td className="pt-1 text-nowrap">
                            hoosat mainnet
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement text-nowrap">
                            Virtual DAA Score
                        </td>
                        <td className="pt-1 align-top" id="virtualDaaScore">
                            {Number(virtualDaaScore).toLocaleString()}
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
                            {(Number(hashrate))} GH/s
                        </td>
                    </tr>
                    <tr>
                        <td className="cardBoxElement">
                            Mempool size
                        </td>
                        <td className="pt-1" id="headerCount">
                            {Number(mempoolSize).toLocaleString()}
                        </td>
                    </tr>
                    { (showHF === true) && (
                        <>
                        <tr>
                            <td className="cardBoxElement nowrap">
                                Hard Fork Date & Time:
                            </td>
                            <td className="pt-1 align-top" id="nextHardForkTime">
                                {nextHardForkTime}
                            </td>
                        </tr>
                        <tr>
                            <td className="cardBoxElement nowrap">
                                Time to the Hard Fork:
                            </td>
                            <td className="pt-1 align-top" id="nextHardForkTime">
                                {nextHardForkTimeTo}
                            </td>
                        </tr>
                        </>
                    )}
                </tbody>
            </table>
        </div>
    </>
}


export default BlockDAGBox;
