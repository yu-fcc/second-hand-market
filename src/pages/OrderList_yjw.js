import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Space, Button, List, Divider } from 'antd';
import { web3, sellerABI, buyGoodContract } from "../contract/contractUtils_yjw";


const OrderListWapper = () => {
    const [menuData, setMenuData] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        getOrder()
        console.log("----------effect-----------")
        //发送请求到后端获取菜单数据

        return () => { //退出组件执行
            console.log("----------return-----------")
        };
    }, []);

    const getOrder = async () => {
        const menuData = [];
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
        var goodListId = await buyGoodContract.methods.getGoodList().call({ from: account });
        for (let i = 1; i <= goodListId.length; i++) {
            var goodlist = await buyGoodContract.methods.getBuyGoodById(i).call({ from: account });
            console.log(goodlist[0])
            console.log(sellerAddress)
            if (goodlist[2] === sellerAddress) {
                var goodId = goodlist[1];
                var total = goodlist[3].toString();
                var quantity = goodlist[4].toString();
                var timestamp = Number(goodlist[5]);
                let date = new Date(timestamp * 1000);
                // 获取年月日时分秒  
                let year = date.getFullYear();
                let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以要加1，并使用padStart填充0  
                let day = date.getDate().toString().padStart(2, '0');
                let hours = date.getHours().toString().padStart(2, '0');
                let minutes = date.getMinutes().toString().padStart(2, '0');
                let seconds = date.getSeconds().toString().padStart(2, '0');
                // 拼接日期和时间字符串  
                let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                var goodInfo = await sellerContract.methods.getProductInfoById(goodId).call({ from: account });
                menuData.push({
                    goodId: goodId,
                    buyerAddress: goodlist[0],
                    sellerAddress: goodlist[2],
                    goodName: goodInfo[1],
                    total: total,
                    quantity: quantity,
                    image: goodInfo[6],
                    time: formattedDateTime,
                });
                setMenuData(menuData);
            }
        }
    }

    return (
        <div>
            <Divider type="vertical" style={{ height: '100%' }} />
            <Divider orientation="left">成交订单记录</Divider>
            <List
                itemLayout="horizontal"
                dataSource={menuData}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={"https://gateway.pinata.cloud/ipfs/" + item.image} />}
                            title={<a>{item.goodName}</a>}
                            description={
                                <div>
                                    <p>买家地址：{item.buyerAddress}</p>
                                    <p>购买数量：{item.quantity}</p>
                                    <p>总消费：{item.total}</p>
                                    <p>下单时间：{item.time}</p>
                                </div>}
                        />
                        <List.Item.Meta
                            style={{ float: 'right' }}
                            description={<Button type="primary" onClick={
                                () => {
                                    navigate(`/api/2/goodsCommont/${item.goodId}`)
                                    window.localStorage.setItem("buyerAddress", item.buyerAddress);
                                }
                            }>交易评价</Button>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );



};
export default OrderListWapper;