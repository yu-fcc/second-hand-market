import React,{ useState,useEffect } from 'react';
import { Card, Descriptions, List } from 'antd';
import { web3, reportsContract,buyerABI,sellerABI} from "../contract/contractUtils_yjw";


const ReportList = () => {
    const [data, setData] = useState([]);
    useEffect(() => {
        console.log("----------effect-----------")
        reports();
        return () => { //退出组件执行
          console.log("----------return-----------")
        };
      }, []); // 空数组[]表示仅在组件挂载时执行
    const reports = async () => {
        const data = [];
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var sellerAddress =window.localStorage.getItem("sellerAddress");
        console.log(sellerAddress);
        var reportIds =await reportsContract.methods.getReportIds().call();
        for (var i = 0; i < reportIds.length; i++) {
            var reportInfo = await reportsContract.methods.getReportInfoById(reportIds[i]).call();           
            if(sellerAddress === reportInfo[2]){
                console.log(reportInfo[2]);
                var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
                var goodInfo = await sellerContract.methods.getProductInfoById(reportInfo[3]).call();
                var goodName = goodInfo[1];
                data.push({
                    goodName:goodName,
                    buyerAddress:reportInfo[1],
                    classes:reportInfo[4],
                    description:reportInfo[5],
                })
                setData(data);
            }
        }
    }

    return (
        <>
         <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <Card title={item.goodName}>
                        <p>举报用户地址：{item.buyerAddress}</p>
                        <p>举报类别：{item.classes}</p>
                        <p>举报描述：{item.description}</p>
                    </Card>
                </List.Item>
            )}
        />
        </>
    );
}
export default ReportList;

