import React,{ useState,useEffect } from 'react';
import { Card, Descriptions, List } from 'antd';
import { web3, reportsContract,buyerABI,sellerABI} from "../contract/contractUtils_yjw";


const ReportList = () => {
    // 定义一个状态变量data，初始值为空数组
    const [data, setData] = useState([]);
    // useEffect函数，在组件挂载时执行
    useEffect(() => {
        console.log("----------effect-----------")
        reports();
        return () => { //退出组件执行
          console.log("----------return-----------")
        };
      }, []); // 空数组[]表示仅在组件挂载时执行
    // 异步函数，获取举报信息
    const reports = async () => {
        const data = [];
        // 请求用户授权
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // 获取用户账户
        const accounts = await web3.eth.getAccounts();
        // 获取卖家地址
        var sellerAddress =window.localStorage.getItem("sellerAddress");
        console.log(sellerAddress);
        // 获取举报ID列表
        var reportIds =await reportsContract.methods.getReportIds().call();
        // 遍历举报ID列表
        for (var i = 0; i < reportIds.length; i++) {
            // 根据举报ID获取举报信息
            var reportInfo = await reportsContract.methods.getReportInfoById(reportIds[i]).call();           
            // 判断举报信息中的卖家地址是否与当前用户地址相同
            if(sellerAddress === reportInfo[2]){
                console.log(reportInfo[2]);
                // 根据卖家地址获取卖家合约
                var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
                // 根据举报信息中的商品ID获取商品信息
                var goodInfo = await sellerContract.methods.getProductInfoById(reportInfo[3]).call();
                // 获取商品名称
                var goodName = goodInfo[1];
                // 将举报信息添加到data数组中
                data.push({
                    goodName:goodName,
                    buyerAddress:reportInfo[1],
                    classes:reportInfo[4],
                    description:reportInfo[5],
                })
                // 更新data状态变量
                setData(data);
            }
        }
    }

    return (
        <>
         <List
            // 设置List组件的网格布局
            grid={{ gutter: 16, column: 2 }}
            // 设置List组件的数据源
            dataSource={data}
            // 设置List组件的渲染函数
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

