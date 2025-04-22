import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Space, Button, List, Divider } from 'antd';
import { web3, sellerABI, buyGoodContract } from "../contract/contractUtils_yjw";


const OrderListWapper = () => {
    // 定义菜单数据状态
    const [menuData, setMenuData] = useState([]);
    // 使用useNavigate钩子函数
    const navigate = useNavigate();
    // 使用useEffect钩子函数，在组件挂载时发送请求到后端获取菜单数据
    useEffect(() => {
        getOrder()
        console.log("----------effect-----------")
        //发送请求到后端获取菜单数据

        return () => { //退出组件执行
            console.log("----------return-----------")
        };
    }, []);

    // 定义获取订单的异步函数
    const getOrder = async () => {
        const menuData = [];
        // 请求用户授权
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // 获取用户账户
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        // 获取卖家地址
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        // 创建卖家合约实例
        var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
        // 获取商品列表ID
        var goodListId = await buyGoodContract.methods.getGoodList().call({ from: account });
        // 遍历商品列表ID
        for (let i = 1; i <= goodListId.length; i++) {
            // 获取商品信息
            var goodlist = await buyGoodContract.methods.getBuyGoodById(i).call({ from: account });
            console.log(goodlist[0])
            console.log(sellerAddress)
            // 判断商品卖家地址是否为当前用户
            if (goodlist[2] === sellerAddress) {
                // 获取商品ID
                var goodId = goodlist[1];
                // 获取商品总消费
                var total = goodlist[3].toString();
                // 获取商品购买数量
                var quantity = goodlist[4].toString();
                // 获取商品下单时间戳
                var timestamp = Number(goodlist[5]);
                // 将时间戳转换为日期时间字符串
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
                // 获取商品信息
                var goodInfo = await sellerContract.methods.getProductInfoById(goodId).call({ from: account });
                // 将商品信息添加到菜单数据中
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
                // 更新菜单数据状态
                setMenuData(menuData);
            }
        }
    }

    // 返回订单列表组件
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
