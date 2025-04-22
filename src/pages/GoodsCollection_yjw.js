import React, { useState, useEffect } from 'react';
import { Card, List, Modal, Button, Pagination, Image, Divider } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { web3, sellerABI, sellerListContract } from "../contract/contractUtils_yjw";


const { Meta } = Card;


const GoodsCollection = () => {
  //  const location = useLocation();
  const [data, setData] = useState([]); // 用于存储商品数据
  const [idData, setIdData] = useState([]); // 用于存储商品ID数据
  const [sellerAdresData, setSellerAdresData] = useState([]); // 用于存储卖家地址数据
  const navigate = useNavigate(); // 用于导航到其他页面
  //const { data } = location.state || [];
  useEffect(() => {
    console.log("----------effect-----------")
    list2();
    return () => { //退出组件执行
      console.log("----------return-----------")
    };
  }, []); // 空数组[]表示仅在组件挂载时执行

  const list2 = async () => {
    const data = [];
    const idData = [];
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // 请求用户授权
    const accounts = await web3.eth.getAccounts(); // 获取用户账户
    var account = accounts[0]; // 获取用户账户地址
    var goodId = window.localStorage.getItem("idData"); // 获取商品ID
    var sellerAdres = window.localStorage.getItem("sellerAdres"); // 获取卖家地址
      var sellerContract = new web3.eth.Contract(sellerABI, sellerAdres); // 创建卖家合约实例
      var userName = await sellerContract.methods.userName().call({ from: account }) // 获取卖家名称
      var sellerId = await sellerContract.methods.newSellerId().call({ from: account }) // 获取卖家ID
        var productInfo = await sellerContract.methods.getProductInfoById(goodId).call({ from: account }) // 获取商品信息
        data.push({
          title: userName,
          sellerId: sellerId,
          sellerAddress: sellerAdres,
          productId: goodId,
          productInfo: productInfo[1],
          price: productInfo[3],
          quantity: productInfo[4],
          imageHash: productInfo[6],
        })
    setData(data); // 设置商品数据
  }

  return (
    <>
      <Divider orientation="left" style={{ fontSize: '30px' }}>收藏的商品</Divider>
      <List
        grid={{
          gutter: 16,
          //column: 4,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{
                width: 250,
              }}
              onClick={
                /*() => showModal(item)*/
                () => {
                  console.log(item)

                  navigate(`/api/1/goodInfoWrapper/${item.productId}`) // 导航到商品详情页面
                  window.localStorage.setItem("sellerId", item.sellerId); // 存储卖家ID
                }


              } // 添加点击事件  
            >
              <Image
                src={"https://gateway.pinata.cloud/ipfs/" + item.imageHash}
                style={{
                  objectFit: 'cover',
                  width: '100%', // 设置为100%以确保图片不超过Card的宽度  
                  height: 250, /* 设置一个固定高度，但请注意这可能会改变宽高比 */

                }}
              />
              <Meta title={"卖家名称：" + item.title} description={<div>
                {"商品名称：" + item.productInfo}
                <br />
                {"商品价格：" + item.price}
                <br />
                {"商品数量：" + item.quantity}
              </div>} />

            </Card>

          </List.Item>

        )}
      />
    </>
  )
};

export default GoodsCollection;
