import React, { useState, useEffect } from 'react';
import { Card, List, Modal, Button, Pagination, Image, Divider } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { web3, sellerABI, sellerListContract } from "../contract/contractUtils_yjw";


const { Meta } = Card;

const IndexListWapper = () => {
  //  const location = useLocation();
  const [data, setData] = useState([]); // 定义一个状态变量data，用于存储商品列表数据
  const navigate = useNavigate(); // 使用useNavigate钩子函数，用于页面跳转
  //const { data } = location.state || [];
  useEffect(() => {
    console.log("----------effect-----------")
    list2(); // 调用list2函数，获取商品列表数据
    return () => { //退出组件执行
      console.log("----------return-----------")
    };
  }, []); // 空数组[]表示仅在组件挂载时执行

  const list2 = async () => {
    const data = []; // 定义一个空数组，用于存储商品列表数据
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // 请求用户授权
    const accounts = await web3.eth.getAccounts(); // 获取用户账户
    var account = accounts[0]; // 获取用户账户地址
    var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account }); // 获取卖家合约地址列表
    var roleId = window.localStorage.getItem("roleId"); // 获取用户角色ID
    if (roleId === '1') { // 如果用户角色为卖家
      for (var i = 0; i < sellerContractAddress.length; i++) { // 遍历卖家合约地址列表
        var sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[i]); // 创建卖家合约实例
        var userName = await sellerContract.methods.userName().call({ from: account }) // 获取卖家用户名
        var sellerId = await sellerContract.methods.newSellerId().call({ from: account }) // 获取卖家ID
        var productIds = await sellerContract.methods.getProductIds().call({ from: account }) // 获取商品ID列表
        for (var j = 0; j < productIds.length; j++) { // 遍历商品ID列表
          var productInfo = await sellerContract.methods.getProductInfoById(productIds[j]).call({ from: account }) // 获取商品信息
          var sellerAddress = sellerContractAddress[i]; // 获取卖家地址
          console.log(sellerAddress);
          var onsale = window.localStorage.getItem("status"); // 获取商品状态
          console.log(onsale)
          if (productInfo[5] == true) { // 如果商品状态为在售
            data.push({
              title: userName,
              sellerId: sellerId,
              owner: sellerAddress,
              productId: productIds[j],
              productInfo: productInfo[1],
              price: productInfo[3],
              quantity: productInfo[4],
              status: productInfo[5],
              imageHash: productInfo[6],
            })
            setData(data); // 更新商品列表数据
          }
        }
      }
    } else { // 如果用户角色为买家
      var sellerId = window.localStorage.getItem("sellerId"); // 获取卖家ID
      var sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[sellerId - 1]); // 创建卖家合约实例
      var userName = await sellerContract.methods.userName().call({ from: account }) // 获取卖家用户名
      var productIds = await sellerContract.methods.getProductIds().call({ from: account }) // 获取商品ID列表
      for (var j = 0; j < productIds.length; j++) { // 遍历商品ID列表
        var productInfo = await sellerContract.methods.getProductInfoById(productIds[j]).call({ from: account }) // 获取商品信息
        var sellerAddress = sellerContractAddress[sellerId - 1]; // 获取卖家地址
        console.log(sellerAddress);
        data.push({
          title: userName,
          owner: sellerAddress,
          productId: productIds[j],
          productInfo: productInfo[1],
          price: productInfo[3],
          quantity: productInfo[4],
          status: productInfo[5],
          imageHash: productInfo[6],
        })
        setData(data); // 更新商品列表数据
      }
    }

  }

  return (
    <div>
      <Divider orientation="left" style={{ fontSize: '30px' }}>商品列表</Divider>
      <List
        grid={{
          gutter: 16,
          //column: 4,
        }}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 6,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{
                width: 300,
              }}
              onClick={
                () => {
                  console.log(item)
                  navigate(`/api/1/goodInfoWrapper/${item.productId}/${item.owner}`)
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
                {"商品状态：" + item.status}
              </div>} />
            </Card>
            <div>
              <Button type="primary" size="medium" className='searchProduct-button'
                onClick={
                  () => {
                    navigate(`/api/1/retrospect/${item.owner}/${item.productId}`)
                  }
                }
              >
                信息追溯
              </Button>
            </div>
          </List.Item>

        )}
      />
    </div>
  )
};

export default IndexListWapper;
